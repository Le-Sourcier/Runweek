import React, { useState } from 'react';
import { usePRs } from '../context/PRContext';
import { PersonalRecord } from '../types'; // Assuming PersonalRecord is in ../types

const PersonalRecords: React.FC = () => {
  const { prs, addPR } = usePRs();

  // State for the form inputs
  const [distance, setDistance] = useState<number | ''>('');
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (distance === '' || !time || !date) {
      alert('Please fill in distance, time, and date.');
      return;
    }
    const newPREntry: Omit<PersonalRecord, 'id'> = {
      distance: Number(distance),
      time,
      date,
      notes,
    };
    addPR(newPREntry);
    // Reset form
    setDistance('');
    setTime('');
    setDate('');
    setNotes('');
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Personal Records</h1>

      <div className="mb-8 p-4 sm:p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Add New Personal Record</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="distance" className="block mb-1 font-medium text-sm text-gray-700">Distance (km):</label>
            <input
              type="number"
              id="distance"
              value={distance}
              onChange={(e) => setDistance(e.target.value === '' ? '' : parseFloat(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="time" className="block mb-1 font-medium text-sm text-gray-700">Time (HH:MM:SS):</label>
            <input
              type="text"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="HH:MM:SS"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="date" className="block mb-1 font-medium text-sm text-gray-700">Date:</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="notes" className="block mb-1 font-medium text-sm text-gray-700">Notes (optional):</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150"
          >
            Add PR
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">My Personal Records</h2>
        {prs.length === 0 ? (
          <p className="text-gray-600">No personal records yet. Add one using the form above!</p>
        ) : (
          <ul className="space-y-4">
            {prs.map((pr) => (
              <li key={pr.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Distance</p>
                    <p className="text-lg text-gray-800">{pr.distance} km</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Time</p>
                    <p className="text-lg text-gray-800">{pr.time}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date</p>
                    <p className="text-lg text-gray-800">{pr.date}</p>
                  </div>
                  {pr.notes && (
                    <div className="sm:col-span-2">
                      <p className="text-sm font-medium text-gray-500">Notes</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{pr.notes}</p>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PersonalRecords;
