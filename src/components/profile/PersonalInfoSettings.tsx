import { useState, useEffect, ChangeEvent } from 'react';
import { useUser } from '../../context/UserContext';
import Card from '../ui/Card';
import { Edit } from 'lucide-react';

interface PersonalInfoSettingsProps {
  onBack: () => void;
}

export default function PersonalInfoSettings({ onBack }: PersonalInfoSettingsProps) {
  const { user, updateUserProfile } = useUser();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedEmail, setEditedEmail] = useState(user?.email || '');
  const [editedProfileImage, setEditedProfileImage] = useState(user?.profileImage || '');

  useEffect(() => {
    if (user) {
      setEditedName(user.name);
      setEditedEmail(user.email);
      setEditedProfileImage(user.profileImage);
    }
  }, [user]);

  if (!user) return null;

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditedName(user.name);
      setEditedEmail(user.email);
      setEditedProfileImage(user.profileImage);
    }
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = () => {
    if (user) {
      updateUserProfile({ name: editedName, email: editedEmail, profileImage: editedProfileImage });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedName(user.name);
    setEditedEmail(user.email);
    setEditedProfileImage(user.profileImage);
    setIsEditing(false);
  };

  const handleProfileImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setEditedProfileImage(event.target.result);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <Card title="Personal Information" className="bg-card text-card-foreground border-border">
      <button onClick={onBack} className="btn btn-ghost mb-4 text-sm">
        &larr; Back to Account Settings
      </button>

      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <img
            src={isEditing ? editedProfileImage : user.profileImage}
            alt={editedName}
            className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-sm"
          />
          {isEditing ? (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="absolute bottom-0 right-0 h-8 w-8 opacity-0 cursor-pointer"
                aria-label="Change profile picture"
                id="profile-image-upload"
              />
              <label htmlFor="profile-image-upload" className="absolute bottom-0 right-0 h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:bg-primary/90">
                <Edit size={14} />
              </label>
            </>
          ) : (
             <button
                onClick={handleEditToggle}
                className="absolute bottom-0 right-0 h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-sm hover:bg-primary-600"
                aria-label="Edit profile image"
              >
                <Edit size={14} />
              </button>
          )}
        </div>

        {isEditing ? (
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="input mt-4 text-center text-xl font-bold w-full max-w-xs bg-background text-foreground border-border focus:ring-primary focus:border-primary"
            aria-label="User name"
          />
        ) : (
          <h2 className="text-xl font-bold mt-4 text-foreground">{user.name}</h2>
        )}

        {isEditing ? (
          <input
            type="email"
            value={editedEmail}
            onChange={(e) => setEditedEmail(e.target.value)}
            className="input mt-2 w-full max-w-xs text-center text-sm bg-background text-foreground border-border focus:ring-primary focus:border-primary"
            aria-label="User email"
          />
        ) : (
          <p className="text-muted-foreground text-sm">{user.email}</p>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        {isEditing ? (
          <div className="space-y-3">
            <button onClick={handleSaveChanges} className="btn btn-primary w-full">Save Changes</button>
            <button onClick={handleCancelEdit} className="btn btn-outline w-full dark:border-muted dark:text-muted-foreground dark:hover:bg-muted/20">Cancel</button>
          </div>
        ) : (
          <button onClick={handleEditToggle} className="btn btn-primary w-full">Edit Profile</button>
        )}
      </div>
    </Card>
  );
}
