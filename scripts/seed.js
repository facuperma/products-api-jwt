import { setDocument } from '../src/modelos/products.models.js';

// Ids fijos: correr el script de nuevo actualiza estos productos en lugar de duplicarlos.
const sampleProducts = [
  { id: 'muestra-auriculares', name: 'Auriculares inalámbricos', description: 'Bluetooth 5.3, cancelación de ruido y 30 horas de batería.', category: 'Audio', price: 45999 },
  { id: 'muestra-teclado', name: 'Teclado mecánico', description: 'Switches rojos, retroiluminación RGB y distribución en español.', category: 'Periféricos', price: 62500 },
  { id: 'muestra-mouse', name: 'Mouse ergonómico', description: 'Sensor de 4000 DPI, seis botones programables y diseño vertical.', category: 'Periféricos', price: 21900 },
  { id: 'muestra-monitor', name: 'Monitor 24" Full HD', description: 'Panel IPS de 75 Hz con bordes finos y entrada HDMI.', category: 'Monitores', price: 189000 },
  { id: 'muestra-webcam', name: 'Cámara web 1080p', description: 'Micrófono incorporado y enfoque automático, ideal para videollamadas.', category: 'Video', price: 34800 },
  { id: 'muestra-ssd', name: 'Disco SSD 1 TB', description: 'NVMe M.2 con lectura de hasta 3500 MB/s.', category: 'Almacenamiento', price: 98700 },
];

for (const { id, ...data } of sampleProducts) {
  await setDocument('products', id, data);
  console.log(`Producto de muestra cargado: ${id}`);
}

console.log(`Listo: ${sampleProducts.length} productos de muestra.`);
process.exit(0);
