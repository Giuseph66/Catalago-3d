import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import db from '../config/database.js';

dotenv.config();

async function resetAdminPassword() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@exemplo.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    console.log('🔄 Resetando senha do admin...');
    console.log('Email:', adminEmail);

    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
    
    if (!user) {
      console.log('❌ Usuário não encontrado. Criando novo usuário...');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(adminEmail, hashedPassword);
      console.log('✅ Usuário admin criado com sucesso!');
    } else {
      console.log('✅ Usuário encontrado. Atualizando senha...');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      db.prepare('UPDATE users SET password = ? WHERE email = ?').run(hashedPassword, adminEmail);
      console.log('✅ Senha atualizada com sucesso!');
    }

    console.log('\n📋 Credenciais:');
    console.log('Email:', adminEmail);
    console.log('Senha:', adminPassword);
    console.log('\n✅ Pronto! Você pode fazer login agora.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao resetar senha:', error);
    process.exit(1);
  }
}

resetAdminPassword();

