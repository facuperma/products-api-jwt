import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';

type Product = {
  id: string;
  name?: string;
  title?: string;
  category?: string;
  price?: number | string;
  description?: string;
};

type ProductForm = {
  name: string;
  description: string;
  category: string;
  price: string;
};

const emptyForm: ProductForm = { name: '', description: '', category: '', price: '' };
const TOKEN_KEY = 'token';

function readStoredToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? '';
  } catch {
    return '';
  }
}

function storeToken(token: string) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Sin almacenamiento la sesión dura hasta recargar la página.
  }
}

async function getErrorMessage(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null);
  if (
    typeof body === 'object' &&
    body !== null &&
    'message' in body &&
    typeof body.message === 'string'
  ) {
    return body.message;
  }

  return `La solicitud falló (${response.status})`;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [token, setToken] = useState(readStoredToken);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/products');
      if (response.status === 400) {
        const body: unknown = await response.json().catch(() => null);
        if (
          typeof body === 'object' &&
          body !== null &&
          'message' in body &&
          body.message === 'No se encontraron productos'
        ) {
          setProducts([]);
          return;
        }
      }
      if (!response.ok) throw new Error(await getErrorMessage(response));

      const result: unknown = await response.json();
      if (!Array.isArray(result)) throw new Error('La API devolvió una lista inválida');
      setProducts(result as Product[]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  function logout(message = '') {
    storeToken('');
    setToken('');
    resetForm();
    setNotice(message);
  }

  // Si el token venció, la API responde 401/403: cerramos la sesión.
  async function authFetch(url: string, init: RequestInit): Promise<Response> {
    const response = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init.headers },
    });
    if (response.status === 401 || response.status === 403) {
      logout('Tu sesión venció. Iniciá sesión de nuevo.');
      throw new Error('Sesión vencida');
    }
    return response;
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setError('');
    setNotice('');

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.status === 401) throw new Error('Email o contraseña incorrectos');
      if (!response.ok) throw new Error(await getErrorMessage(response));

      const body = (await response.json()) as { token: string };
      storeToken(body.token);
      setToken(body.token);
      setPassword('');
      setNotice('Sesión iniciada. Ya podés agregar, editar y eliminar productos.');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'No se pudo iniciar sesión');
    }
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name ?? product.title ?? '',
      description: product.description ?? '',
      category: product.category ?? '',
      price: product.price !== undefined ? String(product.price) : '',
    });
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');

    const payload: Record<string, string | number> = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
    };
    if (form.price.trim() !== '') payload.price = Number(form.price);

    try {
      const response = editingId
        ? await authFetch(`/api/products/${encodeURIComponent(editingId)}`, { method: 'PUT', body: JSON.stringify(payload) })
        : await authFetch('/api/products/create', { method: 'POST', body: JSON.stringify(payload) });
      if (!response.ok) throw new Error(await getErrorMessage(response));

      setNotice(editingId ? 'Producto actualizado.' : 'Producto creado.');
      resetForm();
      await loadProducts();
    } catch (saveError) {
      if (saveError instanceof Error && saveError.message !== 'Sesión vencida') setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    const name = product.name ?? product.title ?? product.id;
    if (!window.confirm(`¿Eliminar "${name}"?`)) return;
    setError('');
    setNotice('');

    try {
      const response = await authFetch(`/api/products/${encodeURIComponent(product.id)}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(await getErrorMessage(response));

      if (editingId === product.id) resetForm();
      setNotice(`"${name}" eliminado.`);
      await loadProducts();
    } catch (deleteError) {
      if (deleteError instanceof Error && deleteError.message !== 'Sesión vencida') setError(deleteError.message);
    }
  }

  const loggedIn = token !== '';

  return (
    <main className="page">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Inicio">
          <span className="brand-mark">P</span>
          <span>Panel de productos</span>
        </a>
        {loggedIn ? (
          <button className="button button-light" onClick={() => logout()}>Cerrar sesión</button>
        ) : (
          <span className="public-label">Catálogo público</span>
        )}
      </header>

      <section className="intro">
        <p className="eyebrow">PROYECTO FINAL · NODE.JS</p>
        <h1>Tu catálogo, <span>en orden.</span></h1>
        <p className="subtitle">
          {loggedIn
            ? 'Agregá, editá o eliminá productos del catálogo.'
            : 'Consultá el catálogo. Iniciá sesión para administrar los productos.'}
        </p>
      </section>

      {error && <div className="feedback feedback-error" role="status">{error}</div>}
      {notice && <div className="feedback feedback-ok" role="status">{notice}</div>}

      {loggedIn ? (
        <form className="panel" onSubmit={handleSave}>
          <p className="eyebrow">{editingId ? `EDITANDO · ${editingId}` : 'NUEVO PRODUCTO'}</p>
          <div className="form-grid">
            <label>
              Nombre
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              Categoría
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </label>
            <label>
              Precio (ARS)
              <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </label>
            <label className="full">
              Descripción
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
          </div>
          <div className="form-actions">
            {editingId && (
              <button type="button" className="button button-light" onClick={resetForm}>Cancelar</button>
            )}
            <button type="submit" className="button button-primary" disabled={saving}>
              {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Agregar producto'}
            </button>
          </div>
        </form>
      ) : (
        <form className="panel login" onSubmit={handleLogin}>
          <p className="eyebrow">ADMINISTRAR</p>
          <div className="form-grid">
            <label>
              Email
              <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>
              Contraseña
              <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="button button-primary">Iniciar sesión</button>
          </div>
        </form>
      )}

      <section className="catalog">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CATÁLOGO</p>
            <h2>Productos <span className="count">{products.length}</span></h2>
          </div>
          <button className="button button-light" onClick={() => void loadProducts()} disabled={loading}>
            {loading ? 'Actualizando…' : '↻ Actualizar'}
          </button>
        </div>

        {loading && products.length === 0 ? (
          <div className="empty-state">Cargando productos…</div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">◇</span>
            <h3>Tu catálogo está vacío</h3>
            <p>Cuando haya productos disponibles, van a aparecer acá.</p>
          </div>
        ) : (
          <div className="product-list">
            {products.map((product) => (
              <article className={`product-card${editingId === product.id ? ' editing' : ''}`} key={product.id}>
                <div className="product-icon">{(product.name ?? product.title ?? 'P').charAt(0).toUpperCase()}</div>
                <div className="product-info">
                  <div className="product-title-row">
                    <h3>{product.name ?? product.title ?? 'Producto sin nombre'}</h3>
                    {product.category && <span className="category">{product.category}</span>}
                  </div>
                  <p>{product.description || 'Sin descripción'}</p>
                  <span className="product-id">ID · {product.id}</span>
                </div>
                <div className="product-side">
                  {product.price !== undefined && product.price !== '' && (
                    <strong className="price">{formatPrice(product.price)}</strong>
                  )}
                  {loggedIn && (
                    <div className="card-actions">
                      <button className="button button-light button-small" onClick={() => startEdit(product)}>Editar</button>
                      <button className="button button-danger button-small" onClick={() => void handleDelete(product)}>Eliminar</button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer>Hecho para el Proyecto Final Node.js <span>·</span> Catálogo en TypeScript</footer>
    </main>
  );
}

function formatPrice(price: number | string): string {
  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice)) return String(price);

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(numericPrice);
}

export default App;
