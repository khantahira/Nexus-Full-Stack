import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Calendar, X } from 'lucide-react';
import { Investor } from '../../types';
import { Card, CardBody, CardFooter } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import API from '../../utils/axiosInstance'; 
import { useAuth } from '../../context/AuthContext'; // 👈 Global Auth Context Engine
import toast from 'react-hot-toast';

interface InvestorCardProps {
  investor: Investor;
  showActions?: boolean;
}

export const InvestorCard: React.FC<InvestorCardProps> = ({ investor, showActions = true }) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // 👈 Active Session Hook pull karne ke liye
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

    const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) {
      toast.error('Please fill in all core fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Storage se explicit context token strict keys pull karein
      const savedToken = localStorage.getItem('business_nexus_token') || 
                          localStorage.getItem('token');

      // 2. Direct core native fetch mechanism trigger karein proxy bypass karne ke liye
      const response = await fetch('http://localhost:5000/api/meetings/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': savedToken || '',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify({
          title,
          date,
          time,
          inviteeId: investor.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Scheduling request rejected by server.');
      }

      toast.success(data.msg || 'Meeting request submitted successfully!');
      setIsModalOpen(false);
      
      // Auto routing back to dashboard view matrix
      navigate('/dashboard/entrepreneur');
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Scheduling parameter network exception.');
    } finally {
      setIsSubmitting(false);
    }
  


    setIsSubmitting(true);
    try {
      // 1. Direct browser runtime cookie/token data fallbacks check karein
      const explicitToken = localStorage.getItem('business_nexus_token') || 
                            localStorage.getItem('token') || 
                            (user as any)?.token;

      // 2. Transmit scheduling object payload targeting backend endpoints
      const response = await API.post('/meetings/schedule', 
        {
          title,
          date,
          time,
          inviteeId: investor.id
        },
        {
          headers: {
            'x-auth-token': explicitToken,
            'Authorization': `Bearer ${explicitToken}`
          }
        }
      );

      toast.success(response.data.msg || 'Meeting request submitted successfully!');
      setIsModalOpen(false);
      
      // Send user back to dashboard view to see the live count matrix update
      navigate('/dashboard/entrepreneur');
      window.location.reload();
    } catch (error: any) {
      const errorMsg = error.response?.data?.msg || 'Scheduling collision or parameter failure.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardBody className="flex items-start space-x-4">
          <Avatar src={investor.avatarUrl} alt={investor.name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{investor.name}</h3>
              <Badge variant={investor.isOnline ? 'success' : 'secondary'}>
                {investor.isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>
            <p className="text-sm text-primary-600 font-medium mb-1">Investor</p>
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{investor.bio || 'Early-stage sector strategic investor.'}</p>
          </div>
        </CardBody>
        
        {showActions && (
          <CardFooter className="bg-gray-50 flex justify-between items-center space-x-2 border-t border-gray-100">
            <Button 
              variant="secondary" 
              size="sm" 
              leftIcon={<MessageCircle size={16} />}
              onClick={() => navigate(`/messages?user=${investor.id}`)}
            >
              Message
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              leftIcon={<Calendar size={16} />}
              onClick={() => setIsModalOpen(true)} 
            >
              Book Meeting
            </Button>
          </CardFooter>
        )}
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative shadow-xl">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold text-gray-900 mb-4">Book Meeting with {investor.name}</h3>
            
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Seed Funding Pitch Discussion"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs focus:outline-hidden focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs focus:outline-hidden focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Time</label>
                  <input 
                    type="time" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs focus:outline-hidden focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <Button type="submit" fullWidth isLoading={isSubmitting}>
                Confirm Appointment Slot
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
