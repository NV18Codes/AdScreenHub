// Utility function to get user display name
export const getUserDisplayName = (user) => {
  if (!user) {
    console.log('🔍 getUserDisplayName: No user provided');
    return 'User';
  }

  console.log('🔍 getUserDisplayName Debug:');
  console.log('📋 User object:', user);
  console.log('📋 User type:', typeof user);
  console.log('📋 User keys:', Object.keys(user));

  // Check for different possible name fields in order of preference
  const possibleNames = [
    user.fullName,
    user.name,
    user.firstName,
    user.displayName,
    user.username,
    user.email?.split('@')[0]
  ];

  console.log('📋 Possible names:', possibleNames);

  // Find the first non-empty name
  const displayName = possibleNames.find(name => 
    name && 
    typeof name === 'string' && 
    name.trim().length > 0
  );

  console.log('📋 Selected display name:', displayName);

  if (displayName) {
    return displayName.trim();
  }

  // Fallback to email prefix if available
  if (user.email) {
    const emailPrefix = user.email.split('@')[0];
    console.log('📋 Using email prefix:', emailPrefix);
    return emailPrefix;
  }

  console.log('📋 Using fallback: User');
  return 'User';
};

// Utility function to get user email
export const getUserEmail = (user) => {
  if (!user) return '';
  
  console.log('🔍 getUserEmail Debug:');
  console.log('📋 User email:', user.email);
  
  return user.email || '';
};

// Utility function to get user initials
export const getUserInitials = (user) => {
  if (!user) return 'U';
  
  const displayName = getUserDisplayName(user);
  const words = displayName.split(' ');
  
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  
  return displayName[0].toUpperCase();
};
