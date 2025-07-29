import React from 'react';
import {
  FaEnvelope,
  FaPhone,
  FaUserShield,
  FaEdit,
  FaSignOutAlt,
  FaCalendarAlt,
} from 'react-icons/fa';

const Profile: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-300 p-10">
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden flex">
        {/* Left Profile Section */}
        <div className="w-1/3 bg-teal-500 text-white p-8 flex flex-col items-center">
          <img
            className="w-40 h-40 rounded-full border-4 border-white mb-4 shadow-md"
            src="https://avatar.iran.liara.run/public/50"
            alt="Admin Profile"
          />
          <h2 className="text-3xl font-semibold mb-2">John Doe</h2>
          <p className="text-lg font-light">Administrator</p>
          <div className="mt-6">
            <div className="flex items-center space-x-2">
              <FaCalendarAlt className="text-white text-xl" />
              <span className="font-light">Bergabung pada 2020-01-01</span>
            </div>
          </div>
        </div>

        {/* Right Profile Info */}
        <div className="w-2/3 p-10">
          <h3 className="text-3xl font-bold text-gray-800 mb-6">
            Informasi Profil
          </h3>

          <div className="space-y-6">
            {[
              {
                icon: <FaEnvelope className="text-teal-500" />,
                label: 'Email',
                value: 'admin@gmail.com',
              },
              {
                icon: <FaUserShield className="text-teal-500" />,
                label: 'Role',
                value: 'Admin',
              },
              {
                icon: <FaPhone className="text-teal-500" />,
                label: 'Phone',
                value: '+62813411311414',
              },
              {
                icon: <FaCalendarAlt className="text-teal-500" />,
                label: 'Tanggal Lahir',
                value: '25 Maret, 1985',
              },
              {
                icon: <FaCalendarAlt className="text-teal-500" />,
                label: 'Alamat',
                value: 'Jl. Raya Pantura',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-lg"
              >
                <span className="text-gray-600 flex items-center space-x-2">
                  {item.icon}
                  <span>{item.label}:</span>
                </span>
                <span className="text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center space-x-6">
            <button className="flex items-center bg-teal-500 text-white py-3 px-6 rounded-lg shadow-lg hover:bg-teal-600 transition text-lg">
              <FaEdit className="mr-2" /> Edit Profil
            </button>
            <button className="flex items-center bg-red-500 text-white py-3 px-6 rounded-lg shadow-lg hover:bg-red-600 transition text-lg">
              <FaSignOutAlt className="mr-2" /> Keluar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
