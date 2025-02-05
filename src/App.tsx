import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Auth from './components/Auth';
import TaskList from './components/TaskList';
import { LogOut } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);

  const handleSignOut = () => {
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      
      {!user ? (
        <Auth onAuth={setUser} />
      ) : (
        <>
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">Task Management System</h1>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 bg-white hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </nav>

          <main className="py-10">
            <TaskList userId={user.id} />
          </main>
        </>
      )}
    </div>
  );
}

export default App;