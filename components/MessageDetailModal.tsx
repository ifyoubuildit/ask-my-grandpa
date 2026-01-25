'use client';

import { useState } from 'react';
import { X, Check, Clock, User, Calendar, MessageCircle } from 'lucide-react';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface MessageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  userRole: 'grandpa' | 'seeker';
  onUpdate: () => void;
}

export default function MessageDetailModal({ 
  isOpen, 
  onClose, 
  request, 
  userRole, 
  onUpdate 
}: MessageDetailModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [proposedTime, setProposedTime] = useState('');

  if (!isOpen || !request) return null;

  const handleAccept = async () => {
    if (userRole === 'grandpa' && (!replyMessage.trim() || !proposedTime.trim())) {
      alert('Please provide your availability and a response message.');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('🔄 Updating request:', {
        requestId: request.id,
        userRole,
        status: userRole === 'grandpa' ? 'accepted' : 'confirmed'
      });

      if (userRole === 'grandpa') {
        // Grandpa accepting the request
        await updateDoc(doc(db, "requests", request.id), {
          status: 'accepted',
          grandpaResponse: replyMessage,
          proposedTime: proposedTime,
          respondedAt: new Date().toISOString()
        });
        console.log('✅ Grandpa response saved successfully');
      } else {
        // Apprentice confirming the time
        await updateDoc(doc(db, "requests", request.id), {
          status: 'confirmed',
          apprenticeConfirmation: replyMessage || 'Time confirmed',
          confirmedAt: new Date().toISOString()
        });
        console.log('✅ Apprentice confirmation saved successfully');
      }
      
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('❌ Error updating request:', error);
      console.error('Error details:', {
        code: error?.code,
        message: error?.message,
        requestId: request.id,
        userRole
      });
      alert(`Failed to update request: ${error?.message || 'Unknown error'}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = async () => {
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, "requests", request.id), {
        status: 'declined',
        declinedAt: new Date().toISOString(),
        declinedBy: userRole
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error declining request:', error);
      alert('Failed to decline request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'accepted': return 'text-blue-600 bg-blue-50';
      case 'confirmed': return 'text-green-600 bg-green-50';
      case 'declined': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const canRespond = () => {
    if (userRole === 'grandpa' && request.status === 'pending') return true;
    if (userRole === 'seeker' && request.status === 'accepted') return true;
    return false;
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-vintage-accent" />
              <h2 className="text-2xl font-heading font-bold text-vintage-dark">
                {request.subject}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="text-vintage-dark/40 hover:text-vintage-dark transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex items-center gap-4 mt-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
            <span className="text-sm text-vintage-dark/60">
              {new Date(request.timestamp).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Participants */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-vintage-cream p-4 rounded-lg">
              <h3 className="font-bold text-vintage-dark mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Apprentice
              </h3>
              <p className="text-vintage-dark">{request.apprenticeName}</p>
              <p className="text-sm text-vintage-dark/60">{request.apprenticeEmail}</p>
            </div>
            
            <div className="bg-vintage-cream p-4 rounded-lg">
              <h3 className="font-bold text-vintage-dark mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Grandpa
              </h3>
              <p className="text-vintage-dark">{request.grandpaName}</p>
              <p className="text-sm text-vintage-dark/60">{request.grandpaEmail}</p>
            </div>
          </div>

          {/* Original Request */}
          <div className="mb-6">
            <h3 className="font-bold text-vintage-dark mb-3">Original Request</h3>
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-vintage-accent">
              <p className="text-vintage-dark mb-2">
                <strong>Skill:</strong> {request.skill}
              </p>
              <p className="text-vintage-dark mb-2">
                <strong>Availability:</strong> {request.availability}
              </p>
              <p className="text-vintage-dark">
                <strong>Message:</strong>
              </p>
              <p className="text-vintage-dark mt-1 italic">"{request.message}"</p>
            </div>
          </div>

          {/* Grandpa Response (if exists) */}
          {request.grandpaResponse && (
            <div className="mb-6">
              <h3 className="font-bold text-vintage-dark mb-3">Grandpa's Response</h3>
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <p className="text-vintage-dark mb-2">
                  <strong>Proposed Time:</strong> {request.proposedTime}
                </p>
                <p className="text-vintage-dark">
                  <strong>Message:</strong>
                </p>
                <p className="text-vintage-dark mt-1 italic">"{request.grandpaResponse}"</p>
              </div>
            </div>
          )}

          {/* Apprentice Confirmation (if exists) */}
          {request.apprenticeConfirmation && (
            <div className="mb-6">
              <h3 className="font-bold text-vintage-dark mb-3">Apprentice's Confirmation</h3>
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                <p className="text-vintage-dark italic">"{request.apprenticeConfirmation}"</p>
              </div>
            </div>
          )}

          {/* Response Form */}
          {canRespond() && (
            <div className="border-t pt-6">
              <h3 className="font-bold text-vintage-dark mb-4">
                {userRole === 'grandpa' ? 'Respond to Request' : 'Confirm Meeting Time'}
              </h3>
              
              {userRole === 'grandpa' && (
                <div className="mb-4">
                  <label className="block text-vintage-dark font-medium mb-2">
                    Proposed Meeting Time
                  </label>
                  <input
                    type="text"
                    value={proposedTime}
                    onChange={(e) => setProposedTime(e.target.value)}
                    placeholder="e.g., Saturday 2pm at my workshop, or Sunday morning at your place"
                    className="w-full bg-vintage-cream border-2 border-vintage-gold/30 rounded-lg p-3 text-vintage-dark focus:border-vintage-accent focus:outline-none"
                  />
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-vintage-dark font-medium mb-2">
                  {userRole === 'grandpa' ? 'Your Response' : 'Confirmation Message'}
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                  placeholder={userRole === 'grandpa' 
                    ? "Let them know you're happy to help and any details about the meeting..."
                    : "Confirm the time works for you or suggest an alternative..."
                  }
                  className="w-full bg-vintage-cream border-2 border-vintage-gold/30 rounded-lg p-3 text-vintage-dark focus:border-vintage-accent focus:outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAccept}
                  disabled={isSubmitting}
                  className="flex-1 bg-vintage-green text-white px-6 py-3 rounded-lg font-bold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {userRole === 'grandpa' ? 'Accept & Respond' : 'Confirm Time'}
                </button>
                
                <button
                  onClick={handleDecline}
                  disabled={isSubmitting}
                  className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Decline
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}