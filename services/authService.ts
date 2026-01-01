
import { db } from './mockDatabase';
import { User } from '../types';

export const authService = {
  login: async (email: string, passwordHash: string): Promise<{ user: User; token: string }> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 500));
    
    const user = db.users.findByEmail(email);
    if (!user || user.passwordHash !== passwordHash) {
      throw new Error('Invalid credentials');
    }

    // In production, this would be a real JWT from a Node server
    const token = `mock_jwt_token_${user.id}_${user.tenantId}`;
    
    return { user, token };
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem('nexus_auth');
    return stored ? JSON.parse(stored).user : null;
  }
};
