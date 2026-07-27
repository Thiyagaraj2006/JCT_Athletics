import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function migratePasswords() {
  console.log('Fetching users...');
  const { data: users, error } = await supabase.from('users').select('*');
  
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  console.log(`Found ${users.length} users. Hashing any plain-text passwords...`);
  
  let updatedCount = 0;
  for (const user of users) {
    // If the password doesn't start with '$2b$', it's plain text (or empty) and needs to be hashed
    if (!user.password || !user.password.startsWith('$2b$')) {
      const rawPassword = user.password || 'password123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(rawPassword, salt);

      const { error: updateError } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', user.id);
        
      if (updateError) {
        console.error(`Error updating user ${user.email}:`, updateError);
      } else {
        updatedCount++;
        console.log(`Hashed password for ${user.email}`);
      }
    }
  }

  console.log(`Successfully updated ${updatedCount} users with hashed passwords.`);
}

migratePasswords();
