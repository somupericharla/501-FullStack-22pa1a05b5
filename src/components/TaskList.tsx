import React, { useState, useEffect } from 'react';
import { createTask, getTasks, updateTask, deleteTask } from '../lib/db';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

type Task = {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  user_id: string;
  created_at: string;
  updated_at: string;
};

export default function TaskList({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<Task['status']>('PENDING');

  useEffect(() => {
    fetchTasks();
  }, [filter, userId]);

  const fetchTasks = async () => {
    try {
      const tasks = await getTasks(userId, filter);
      setTasks(tasks);
    } catch (error) {
      toast.error('Error fetching tasks');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const task = await createTask(userId, newTask.title, newTask.description);
      setTasks([task, ...tasks]);
      setNewTask({ title: '', description: '' });
      toast.success('Task created successfully');
    } catch (error) {
      toast.error('Error creating task');
    }
  };

  const handleUpdateTask = async (task: Task, newStatus?: Task['status']) => {
    const updates = {
      ...(editingTask ? {
        title: editingTask.title,
        description: editingTask.description
      } : {}),
      ...(newStatus ? { status: newStatus } : {})
    };

    try {
      await updateTask(task.id, userId, updates);
      await fetchTasks();
      setEditingTask(null);
      toast.success('Task updated successfully');
    } catch (error) {
      toast.error('Error updating task');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id, userId);
      setTasks(tasks.filter(task => task.id !== id));
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Error deleting task');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Create New Task</h2>
        <form onSubmit={handleCreateTask} className="space-y-4">
          <input
            type="text"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            placeholder="Task description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="w-full p-2 border rounded"
            rows={3}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusCircle size={20} />
            Create Task
          </button>
        </form>
      </div>

      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Tasks</h2>
        <div className="flex gap-2">
          {(['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="border rounded p-4 bg-white shadow">
            {editingTask?.id === task.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <textarea
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateTask(task)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingTask(null)}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{task.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingTask(task)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{task.description}</p>
                <div className="flex gap-2">
                  {task.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleUpdateTask(task, 'COMPLETED')}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Mark Complete
                    </button>
                  )}
                  {task.status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateTask(task, 'IN_PROGRESS')}
                      className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                    >
                      Start Progress
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
