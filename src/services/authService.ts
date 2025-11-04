/**
 * Simulates user login.
 * In a real app, this would make an API call.
 */
export const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    console.log(`SERVICE: Attempting login for user "${username}"...`);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
  
    // For this mock, we'll accept any non-empty username/password.
    if (username && password) {
      return { success: true };
    }
  
    return { success: false, message: 'Invalid username or password.' };
};
  
/**
 * Simulates admin login.
 */
export const adminLogin = async (adminId: string, password: string): Promise<{ success: boolean; message?: string }> => {
    console.log(`SERVICE: Attempting login for admin "${adminId}"...`);
    await new Promise(resolve => setTimeout(resolve, 800));
  
    // Simple mock validation for the admin.
    if (adminId === 'admin' && password === 'password') {
      return { success: true };
    }
  
    return { success: false, message: 'Invalid admin credentials.' };
};

/**
 * Simulates sending a password reset link.
 */
export const sendPasswordReset = async (email: string): Promise<{ success: boolean; message?: string }> => {
    console.log(`SERVICE: Sending password reset link to "${email}"...`);
    await new Promise(resolve => setTimeout(resolve, 1200));

    if (email && email.includes('@')) {
        return { success: true, message: 'If an account exists for this email, a reset link has been sent.' };
    }
    
    return { success: false, message: 'Please enter a valid email address.' };
};
