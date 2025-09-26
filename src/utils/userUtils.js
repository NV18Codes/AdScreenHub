// Utility function to get user display name
export const getUserDisplayName = (user) => {
  if (!user) {
    return 'User';
  }


  // Check for different possible name fields in order of preference
  const possibleNames = [
    user.fullName,
    user.name,
    user.firstName,
    user.displayName,
    user.username,
    user.email?.split('@')[0]
  ];

  // Find the first non-empty name
  const displayName = possibleNames.find(name => 
    name && 
    typeof name === 'string' && 
    name.trim().length > 0
  );

  if (displayName) {
    return displayName.trim();
  }

  // Fallback to email prefix if available
  if (user.email) {
    const emailPrefix = user.email.split('@')[0];
    return emailPrefix;
  }

  return 'User';
};

// Utility function to get user email
export const getUserEmail = (user) => {
  if (!user) return '';
  
  
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
