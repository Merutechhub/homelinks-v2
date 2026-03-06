import { useState } from 'react';
import { Calendar, Clock, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

interface BookingCardProps {
  listingId: string;
  listingTitle: string;
  landlordId: string;
  onSuccess?: () => void;
}

export function BookingCard({ listingId, listingTitle, landlordId, onSuccess }: BookingCardProps) {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    preferredDate: '',
    preferredTime: '10:00',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to request a viewing');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.from('bookings').insert({
        listing_id: listingId,
        renter_id: user.id,
        landlord_id: landlordId,
        preferred_date: formData.preferredDate,
        preferred_time: formData.preferredTime,
        message: formData.message || null,
        status: 'pending',
      });

      if (error) throw error;

      alert('Tour request sent successfully! The landlord will contact you soon.');
      setFormData({ preferredDate: '', preferredTime: '10:00', message: '' });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to request tour:', error);
      alert('Failed to send tour request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Schedule a Viewing</h3>
        <p className="text-gray-600 mb-4">Sign in to request a property tour</p>
        <button className="btn-primary w-full">Sign In</button>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">Schedule a Viewing</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Preferred Date
          </label>
          <input
            type="date"
            value={formData.preferredDate}
            onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Preferred Time
          </label>
          <select
            value={formData.preferredTime}
            onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="09:00">9:00 AM</option>
            <option value="10:00">10:00 AM</option>
            <option value="11:00">11:00 AM</option>
            <option value="12:00">12:00 PM</option>
            <option value="13:00">1:00 PM</option>
            <option value="14:00">2:00 PM</option>
            <option value="15:00">3:00 PM</option>
            <option value="16:00">4:00 PM</option>
            <option value="17:00">5:00 PM</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Message (optional)
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Any questions or special requests?"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Sending...' : 'Request Tour'}
        </button>
      </form>
    </div>
  );
}
