'use client';

import React, {useEffect, useState} from 'react';
import AdminForm from '@/components/adminForm';
import {fetchAll, saveRecord, deleteRecord, uploadFile} from '@/services/adminService';
import {Poppins} from "next/font/google";

const poppins4 = Poppins({weight: "400", subsets: ["latin"]});
const poppins2 = Poppins({weight: "300", subsets: ["latin"]});

interface Announcement {
    id: string;
    title: string;
    description: string;
    imageSrc: string;
}

const AdminAnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [formData, setFormData] = useState({id: '', title: '', description: '', imageSrc: ''});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAnnouncements = async () => {
            setLoading(true);
            try {
                const data = await fetchAll('announcements');
                setAnnouncements(data);
            } catch (error) {
                console.error('Error fetching announcements:', error);
            } finally {
                setLoading(false);
            }
        };
        loadAnnouncements();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const file = files[0];

        try {
            const path = await uploadFile(file, '/api/announcement_images_upload');
            setFormData({...formData, imageSrc: path});
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await saveRecord('announcements', formData);
            const data = await fetchAll('announcements');
            setAnnouncements(data);
            setFormData({id: '', title: '', description: '', imageSrc: ''});
        } catch (error) {
            console.error('Error saving announcement:', error);
        }
    };

    const handleDelete = async (id: string, imagePath: string) => {
        try {
            await deleteRecord('announcements', id, imagePath);
            const data = await fetchAll('announcements');
            setAnnouncements(data);
        } catch (error) {
            console.error('Error deleting announcement:', error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-[30px]">
            <div className="flex flex-col py-[70px] justify-center items-center relative ">
                <h1 className={`${poppins4.className} absolute text-[30px] sm:text-[40px] md:text-[60px] font-extrabold text-gray-300 `}>Announcements</h1>
            </div>

            <div className={`${poppins2.className} px-[50px] sm:px-[100px] md:px-[150px]`}>
                <AdminForm
                    fields={[
                        {
                            label: 'Title',
                            name: 'title',
                            type: 'text',
                            value: formData.title,
                            onChange: handleChange,
                            required: true,
                        },
                        {
                            label: 'Description',
                            name: 'description',
                            type: 'text',
                            value: formData.description,
                            onChange: handleChange,
                            required: true,
                        },
                        {
                            label: 'Image',
                            name: 'imageSrc',
                            type: 'file',
                            onChange: (e) => handleFileUpload(e.target.files),
                            required: true,
                        },
                    ]}
                    onSubmit={handleSubmit}
                    buttonText={formData.id ? 'Update Announcement' : 'Add Announcement'}
                />
            </div>


            <div className="grid grid-cols-1 gap-6 mt-6">
                {announcements.map((announcement) => (
                    <div key={announcement.id}
                         className="max-w-sm rounded overflow-hidden shadow-lg bg-black text-white">
                        <div className="relative">
                            {/* Background Image */}
                            <img
                                src={announcement.imageSrc}
                                alt={announcement.title}
                                className="w-full h-56 object-cover"
                            />
                            {/* Top Right Badge */}
                            <div
                                className="absolute top-2 right-2 bg-gray-900 text-white text-sm px-3 py-1 rounded-full shadow-md">
                                {announcement.title}
                            </div>
                        </div>
                        {/* Bottom Text */}
                        <div className="px-4 py-2 bg-gray-800 text-gray-400 text-sm">
                            {announcement.description}
                        </div>
                        <div className="flex justify-end space-x-2 mt-2 px-4 pb-4">
                            <button
                                onClick={() => setFormData(announcement)}
                                className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(announcement.id, announcement.imageSrc)}
                                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminAnnouncementsPage;

