const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'AdminPassword123!@#';
  const hash = await bcrypt.hash(password, 12);
  console.log('Hash:', hash);
  
  // Verificar se funciona
  const match = await bcrypt.compare(password, hash);
  console.log('Comparação:', match);
}

generateHash().catch(err => console.error(err));
