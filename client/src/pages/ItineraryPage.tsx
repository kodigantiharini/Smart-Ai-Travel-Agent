import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Trash2,
  ChevronUp,
  ChevronDown,
  Navigation,
  Download,
  Share2,
  Plus,
  Compass,
  AlertTriangle,
  Car,
  ShieldCheck,
  DollarSign,
  CloudSun,
  Users,
  Vote,
  MessageCircle,
  Plane,
  CheckCircle,
  Copy,
  Check,
  Send,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Building,
  Tag,
  X,
} from 'lucide-react';
import { Trip, ItineraryDay, ItineraryStop, WeatherReport, TripCollaborator, TripVote, TripMessage, TripBooking } from '../types';
import { api } from '../services/api';
import { MapView } from '../components/MapView';
import { WeatherWidget } from '../components/WeatherWidget';
import { useAuth } from '../context/AuthContext';

export const ItineraryPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  // MiVoyage Active Sub-tab: 'timeline' | 'votes' | 'chat' | 'bookings'
  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'votes' | 'chat' | 'bookings'>('timeline');

  // MiVoyage Collaboration State
  const [collaborators, setCollaborators] = useState<TripCollaborator[]>([]);
  const [votes, setVotes] = useState<TripVote[]>([]);
  const [messages, setMessages] = useState<TripMessage[]>([]);
  const [bookings, setBookings] = useState<TripBooking[]>([]);

  // Modals & Inputs
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [inviting, setInviting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Proposal modal
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [propName, setPropName] = useState('');
  const [propCategory, setPropCategory] = useState('activity');
  const [propCost, setPropCost] = useState<number>(0);
  const [propDay, setPropDay] = useState<number>(1);
  const [propDesc, setPropDesc] = useState('');
  const [proposing, setProposing] = useState(false);

  // Group chat input
  const [chatInput, setChatInput] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Add booking modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bkType, setBkType] = useState<'hotel' | 'flight' | 'transport' | 'activity'>('hotel');
  const [bkTitle, setBkTitle] = useState('');
  const [bkProvider, setBkProvider] = useState('');
  const [bkRef, setBkRef] = useState('');
  const [bkDate, setBkDate] = useState('');
  const [bkDetails, setBkDetails] = useState('');
  const [bkAmount, setBkAmount] = useState<number>(0);
  const [addingBooking, setAddingBooking] = useState(false);

  // Weather & Live Routes
  const [weatherData, setWeatherData] = useState<WeatherReport | null>(null);
  const [routePolyline, setRoutePolyline] = useState<[number, number][]>([]);
  const [routeMetrics, setRouteMetrics] = useState<{ distanceKm: number; durationMinutes: number; travelMode?: string } | undefined>(undefined);

  // Currency conversion
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [convertingFx, setConvertingFx] = useState(false);

  const fetchTripData = async () => {
    if (!tripId) return;
    try {
      const [tripRes, itinRes] = await Promise.all([
        api.getTrip(tripId),
        api.getTripItinerary(tripId),
      ]);

      if (tripRes.data) {
        const t = tripRes.data;
        setTrip(t);
        setSelectedCurrency(t.currency || 'USD');
        setCollaborators(t.collaborators || []);
        setVotes(t.votes || []);
        setMessages(t.messages || []);
        setBookings(t.bookings || []);

        api.getWeather(undefined, undefined, t.destination).then((wRes) => {
          if (wRes.data) setWeatherData(wRes.data);
        }).catch(console.warn);
      }
      if (itinRes.data) {
        setDays(itinRes.data);
      }
    } catch (err) {
      console.error('Failed to load itinerary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripData();
  }, [tripId]);

  // Recalculate route polyline when active day changes
  useEffect(() => {
    const activeDay = days[activeDayIndex] || days[0];
    const stops = activeDay?.stops || [];

    if (stops.length >= 2) {
      const orig = stops[0].coordinates;
      const dest = stops[stops.length - 1].coordinates;
      if (orig?.lat && dest?.lat) {
        api.getRoutes(orig, dest, 'DRIVE').then((rRes) => {
          if (rRes.data?.coordinates) {
            setRoutePolyline(rRes.data.coordinates);
            setRouteMetrics({
              distanceKm: rRes.data.distanceKm,
              durationMinutes: rRes.data.durationMinutes,
              travelMode: 'drive',
            });
          }
        }).catch(() => {
          setRoutePolyline(stops.map((s) => [s.coordinates.lat, s.coordinates.lng]));
        });
      }
    } else if (stops.length === 1 && stops[0].coordinates?.lat) {
      setRoutePolyline([[stops[0].coordinates.lat, stops[0].coordinates.lng]]);
      setRouteMetrics(undefined);
    } else {
      setRoutePolyline([]);
      setRouteMetrics(undefined);
    }
  }, [days, activeDayIndex]);

  // Currency conversion
  const handleCurrencyChange = async (newCurr: string) => {
    if (!trip || newCurr === selectedCurrency) return;
    setConvertingFx(true);
    try {
      const res = await api.convertCurrency(1, trip.currency || 'USD', newCurr);
      if (res.data?.exchangeRate) {
        setExchangeRate(res.data.exchangeRate);
        setSelectedCurrency(newCurr);
      }
    } catch (err) {
      console.warn('Currency convert error:', err);
    } finally {
      setConvertingFx(false);
    }
  };

  const handleMoveStop = async (dayIdx: number, stopIdx: number, direction: 'up' | 'down') => {
    const newDays = [...days];
    const currentStops = [...newDays[dayIdx].stops];
    const targetIdx = direction === 'up' ? stopIdx - 1 : stopIdx + 1;

    if (targetIdx < 0 || targetIdx >= currentStops.length) return;

    const temp = currentStops[stopIdx];
    currentStops[stopIdx] = currentStops[targetIdx];
    currentStops[targetIdx] = temp;

    currentStops.forEach((s, i) => (s.order = i));
    newDays[dayIdx].stops = currentStops;

    setDays(newDays);
    await saveItinerary(newDays);
  };

  const handleDeleteStop = async (dayIdx: number, stopIdx: number) => {
    if (!confirm('Are you sure you want to remove this stop from your itinerary?')) return;
    const newDays = [...days];
    newDays[dayIdx].stops.splice(stopIdx, 1);
    newDays[dayIdx].stops.forEach((s, i) => (s.order = i));

    setDays(newDays);
    await saveItinerary(newDays);
  };

  const saveItinerary = async (updatedDays: ItineraryDay[]) => {
    if (!tripId) return;
    setSaving(true);
    try {
      await api.updateTripItinerary(tripId, updatedDays);
    } catch (err) {
      console.error('Failed to save itinerary changes:', err);
    } finally {
      setSaving(false);
    }
  };

  // Invite collaborator
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId || !inviteEmail.trim() || !inviteName.trim()) return;

    setInviting(true);
    try {
      const res = await api.inviteCollaborator(tripId, inviteName.trim(), inviteEmail.trim(), inviteRole);
      if (res.data) {
        setCollaborators(res.data);
      }
      setShowInviteModal(false);
      setInviteName('');
      setInviteEmail('');
    } catch (err: any) {
      alert(`Invitation failed: ${err.message}`);
    } finally {
      setInviting(false);
    }
  };

  // Propose activity
  const handleProposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId || !propName.trim()) return;

    setProposing(true);
    try {
      const res = await api.proposeTripVote(tripId, {
        activityName: propName.trim(),
        category: propCategory,
        estimatedCost: Number(propCost) || 0,
        dayNumber: Number(propDay) || 1,
        description: propDesc.trim(),
      });
      if (res.votes) {
        setVotes(res.votes);
      }
      setShowProposeModal(false);
      setPropName('');
      setPropDesc('');
      setPropCost(0);
    } catch (err: any) {
      alert(`Proposal failed: ${err.message}`);
    } finally {
      setProposing(false);
    }
  };

  // Cast Vote
  const handleVote = async (voteId: string, type: 'up' | 'down') => {
    if (!tripId) return;
    try {
      const res = await api.castTripVote(tripId, voteId, type);
      if (res.votes) {
        setVotes(res.votes);
      }
    } catch (err: any) {
      console.error('Vote failed:', err);
    }
  };

  // Approve vote to itinerary
  const handleApproveVote = async (voteId: string) => {
    if (!tripId) return;
    try {
      const res = await api.approveVoteToItinerary(tripId, voteId);
      alert(res.message || 'Activity added to your day schedule!');
      await fetchTripData();
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  // Send Chat Message
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId || !chatInput.trim() || sendingMsg) return;

    setSendingMsg(true);
    try {
      const res = await api.sendTripMessage(tripId, chatInput.trim());
      if (res.messages) {
        setMessages(res.messages);
      }
      setChatInput('');
    } catch (err: any) {
      console.error('Chat send error:', err);
    } finally {
      setSendingMsg(false);
    }
  };

  // Add Booking
  const handleAddBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId || !bkTitle.trim() || !bkProvider.trim() || !bkRef.trim()) return;

    setAddingBooking(true);
    try {
      const res = await api.linkTripBooking(tripId, {
        type: bkType,
        title: bkTitle.trim(),
        provider: bkProvider.trim(),
        referenceNumber: bkRef.trim(),
        date: bkDate || trip?.startDate || new Date().toISOString().split('T')[0],
        details: bkDetails.trim(),
        amount: Number(bkAmount) || 0,
        currency: selectedCurrency,
      });
      if (res.bookings) {
        setBookings(res.bookings);
      }
      setShowBookingModal(false);
      setBkTitle('');
      setBkProvider('');
      setBkRef('');
      setBkDetails('');
      setBkAmount(0);
    } catch (err: any) {
      alert(`Booking link failed: ${err.message}`);
    } finally {
      setAddingBooking(false);
    }
  };

  const handleCopyInviteCode = () => {
    if (!trip?.inviteCode) return;
    navigator.clipboard?.writeText(trip.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleExport = () => {
    const textContent = `TRIPWISE AI & MIVOYAGE GROUNDED ITINERARY: ${trip?.name}
Destination: ${trip?.destination}
Dates: ${trip?.startDate} to ${trip?.endDate}
Budget: ${selectedCurrency} ${Math.round((trip?.budget || 0) * exchangeRate)}
Invite Code: ${trip?.inviteCode || 'N/A'}
Collaborators: ${collaborators.map((c) => `${c.name} (${c.role})`).join(', ')}

${days
  .map(
    (d) => `--- ${d.title} (${d.date}) ---
Weather Forecast: ${d.weather?.condition || 'Mild'} (${d.weather?.tempMax || 24}°C) • Rain: ${d.weather?.rainProbability || 0}%
${d.weather?.advisory ? `Advisory: ${d.weather.advisory}\n` : ''}
${d.stops
  .map(
    (s, i) =>
      `${i + 1}. ${s.name} [${s.arrivalTime} - ${s.departureTime}]
   Category: ${s.category.replace('_', ' ')}
   Address: ${s.address}
   Estimated Duration: ${s.visitDurationMinutes} mins | Cost: ${selectedCurrency} ${Math.round((s.estimatedCost || 0) * exchangeRate)}
   ${s.travelTimeMinutes ? `Driving time from previous stop: ~${s.travelTimeMinutes} mins (${s.distanceFromPrevKm || 5} km)` : ''}
   ${s.notes ? `Note: ${s.notes}` : ''}`
  )
  .join('\n\n')}`
  )
  .join('\n\n')}
`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${trip?.name || 'TripWise'}_Itinerary.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-3">
        <h2 className="text-xl font-bold">Trip not found</h2>
        <Link to="/trips" className="text-blue-600 font-bold hover:underline">
          Return to My Trips
        </Link>
      </div>
    );
  }

  const activeDay = days[activeDayIndex] || days[0];
  const activeStops = activeDay?.stops || [];
  const mapPlaces = activeStops.map((s) => ({
    id: s.placeId || s.id || '',
    placeId: s.placeId,
    name: s.name,
    city: trip.destination,
    country: '',
    category: s.category,
    description: s.notes || '',
    coordinates: s.coordinates,
    address: s.address,
    rating: 4.8,
    ratingCount: 100,
    photos: s.photo ? [s.photo] : [],
    tags: [s.category],
    suggestedDurationMinutes: s.visitDurationMinutes,
  }));

  const activeDayWeather = activeDay?.weather;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/trips')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> All Trips
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white">
              {trip.name}
            </h1>
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              MiVoyage Collaborative
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {trip.destination} • {trip.startDate} to {trip.endDate} • {trip.travelers} traveler(s)
          </p>
        </div>

        {/* Currency & Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 self-start md:self-auto w-full md:w-auto">
          {/* Currency Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs min-h-[44px]">
            <DollarSign size={14} className="text-blue-500 ml-1.5" />
            {(['USD', 'INR', 'EUR', 'GBP', 'AED'] as const).map((cur) => (
              <button
                key={cur}
                onClick={() => handleCurrencyChange(cur)}
                className={`px-2.5 py-1.5 rounded-xl font-bold transition-all min-h-[36px] ${
                  selectedCurrency === cur
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
                }`}
              >
                {cur}
              </button>
            ))}
          </div>

          <Link
            to={`/budget?tripId=${tripId}`}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-blue-600 transition-colors min-h-[44px] flex items-center justify-center shadow-xs"
          >
            Budget
          </Link>

          <button
            onClick={handleExport}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 transition-all shadow-xs min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* MiVoyage Travel Crew & Collaborator Banner */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Travel Crew
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                {collaborators.length} Members
              </span>
            </div>
            {/* Collaborator Avatars */}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {collaborators.map((c, idx) => (
                <div
                  key={c.userId || idx}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200/60 dark:border-slate-600 text-xs"
                  title={`${c.name} (${c.role})`}
                >
                  <img
                    src={c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={c.name}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] truncate max-w-[100px]">
                    {c.name}
                  </span>
                  <span className="text-[9px] text-blue-600 dark:text-blue-400 capitalize font-bold">
                    • {c.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {trip.inviteCode && (
            <button
              onClick={handleCopyInviteCode}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-mono text-xs font-bold transition-all flex items-center gap-1.5 min-h-[40px]"
              title="Copy Invite Code to share with friends"
            >
              <span>Code: {trip.inviteCode}</span>
              {copiedCode ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>
          )}

          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs transition-all flex items-center gap-1.5 min-h-[40px] shadow-sm shadow-blue-500/20"
          >
            <Plus size={14} />
            <span>Invite Friend</span>
          </button>
        </div>
      </div>

      {/* Weather Header Widget */}
      {weatherData && (
        <div>
          <WeatherWidget weather={weatherData} />
        </div>
      )}

      {/* MiVoyage Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveSubTab('timeline')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap min-h-[42px] ${
            activeSubTab === 'timeline'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar size={15} />
          <span>Itinerary Timeline</span>
        </button>

        <button
          onClick={() => setActiveSubTab('votes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap min-h-[42px] ${
            activeSubTab === 'votes'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Vote size={15} />
          <span>Group Activity Voting</span>
          {votes.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-extrabold">
              {votes.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('chat')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap min-h-[42px] ${
            activeSubTab === 'chat'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageCircle size={15} />
          <span>Group Chat & Coordination</span>
          {messages.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-extrabold">
              {messages.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('bookings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap min-h-[42px] ${
            activeSubTab === 'bookings'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Plane size={15} />
          <span>Attached Bookings</span>
          {bookings.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-extrabold">
              {bookings.length}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: ITINERARY TIMELINE (Default)                       */}
      {/* ========================================================= */}
      {activeSubTab === 'timeline' && (
        <div className="space-y-6">
          {/* Day Tabs */}
          {days.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
              {days.map((d, idx) => (
                <button
                  key={d._id || idx}
                  onClick={() => setActiveDayIndex(idx)}
                  className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeDayIndex === idx
                      ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <span>Day {d.dayNumber}: {d.title || d.date}</span>
                  {d.weather && (
                    <span className="text-[10px] opacity-80">
                      • {d.weather.tempMax}°C {d.weather.rainProbability > 30 ? '💧' : '☀️'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Day Advisory Alert if Weather Impact */}
          {activeDayWeather?.advisory && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs">
              <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Weather Context for Day {activeDay?.dayNumber}: </span>
                <span>{activeDayWeather.advisory}</span>
              </div>
            </div>
          )}

          {/* Stops Schedule + Interactive Day Map */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Stops List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>{activeStops.length} Chronological Stops</span>
                {saving && <span className="text-blue-600 animate-pulse font-bold">Saving changes...</span>}
              </div>

              {activeStops.length === 0 ? (
                <div className="bg-white dark:bg-slate-800/80 p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <Compass className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    No stops scheduled for this day
                  </p>
                  <p className="text-xs text-slate-500">
                    Propose activities in the Voting tab or add verified destinations.
                  </p>
                  <button
                    onClick={() => setActiveSubTab('votes')}
                    className="inline-block px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl"
                  >
                    Open Group Voting
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeStops.map((stop, sIdx) => (
                    <div key={stop.id || sIdx} className="space-y-2">
                      {sIdx > 0 && (
                        <div className="flex items-center gap-2 pl-6 py-1 text-slate-400 text-xs">
                          <div className="w-0.5 h-6 bg-blue-500/40 ml-2" />
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
                            <Car size={12} className="text-blue-500" />
                            <span>~{stop.travelTimeMinutes || 20} mins drive ({stop.distanceFromPrevKm || 6.5} km)</span>
                          </div>
                        </div>
                      )}

                      <div className="bg-white dark:bg-slate-800/90 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 space-y-3 shadow-xs">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white font-display font-extrabold flex items-center justify-center shrink-0 shadow-sm">
                              {sIdx + 1}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                                  {stop.category.replace(/_/g, ' ')}
                                </span>
                                <span className="text-xs text-slate-400">
                                  {stop.arrivalTime} - {stop.departureTime}
                                </span>
                              </div>

                              <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                                {stop.name}
                              </h3>

                              <p className="text-xs text-slate-500 truncate max-w-sm">
                                {stop.address}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleMoveStop(activeDayIndex, sIdx, 'up')}
                              disabled={sIdx === 0}
                              title="Move Up in Schedule"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleMoveStop(activeDayIndex, sIdx, 'down')}
                              disabled={sIdx === activeStops.length - 1}
                              title="Move Down in Schedule"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteStop(activeDayIndex, sIdx)}
                              title="Remove Stop"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {stop.notes && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                            "{stop.notes}"
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-400">
                          <span>Visit Duration: ~{stop.visitDurationMinutes} mins</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            Est. Cost: {selectedCurrency} {Math.round((stop.estimatedCost || 0) * exchangeRate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Day Map Route View */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 h-[360px] sm:h-[450px] lg:h-[550px] rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
              <MapView
                places={mapPlaces}
                routeCoordinates={routePolyline}
                routeMetrics={routeMetrics}
                showStopNumbers={true}
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: GROUP ACTIVITY VOTING & POLLS (MiVoyage Feature)   */}
      {/* ========================================================= */}
      {activeSubTab === 'votes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800/80 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700">
            <div>
              <h2 className="text-lg font-display font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Vote size={20} className="text-blue-600" />
                <span>Group Activity Voting & Polls</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Propose places to visit, vote with your crew, and add majority-approved activities straight to the itinerary schedule.
              </p>
            </div>

            <button
              onClick={() => setShowProposeModal(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-500/20 shrink-0"
            >
              <Plus size={15} />
              <span>Propose New Activity</span>
            </button>
          </div>

          {votes.length === 0 ? (
            <div className="bg-white dark:bg-slate-800/60 p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
              <Vote size={36} className="mx-auto text-blue-500 opacity-60" />
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">No activity proposals yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Got a restaurant, sunset lookout, or museum in mind? Propose it so your group can vote!
              </p>
              <button
                onClick={() => setShowProposeModal(true)}
                className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Propose Activity
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {votes.map((v) => {
                const currentUserId = user?.id || 'demo-user';
                const hasUpvoted = v.upvotes?.includes(currentUserId);
                const hasDownvoted = v.downvotes?.includes(currentUserId);
                const isApproved = v.status === 'approved';

                return (
                  <div
                    key={v.id}
                    className={`bg-white dark:bg-slate-800/90 rounded-3xl p-5 border transition-all space-y-3 shadow-xs ${
                      isApproved
                        ? 'border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/20'
                        : 'border-slate-200/80 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md capitalize">
                            {v.category}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Target: Day {v.dayNumber || 1}
                          </span>
                          {isApproved && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
                              <CheckCircle size={10} />
                              <span>Approved</span>
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {v.activityName}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Proposed by <span className="font-semibold text-slate-700 dark:text-slate-300">{v.proposerName}</span>
                        </p>
                      </div>

                      {v.estimatedCost > 0 && (
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {selectedCurrency} {v.estimatedCost}
                          </span>
                          <div className="text-[10px] text-slate-400">Est. cost</div>
                        </div>
                      )}
                    </div>

                    {v.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                        "{v.description}"
                      </p>
                    )}

                    {/* Voting Action Bar */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVote(v.id, 'up')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            hasUpvoted
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600'
                          }`}
                        >
                          <ThumbsUp size={13} />
                          <span>{v.upvotes?.length || 0}</span>
                        </button>

                        <button
                          onClick={() => handleVote(v.id, 'down')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            hasDownvoted
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600'
                          }`}
                        >
                          <ThumbsDown size={13} />
                          <span>{v.downvotes?.length || 0}</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleApproveVote(v.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <Plus size={12} />
                        <span>Add to Day {v.dayNumber || 1}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: GROUP CHAT & COORDINATION (MiVoyage Feature)       */}
      {/* ========================================================= */}
      {activeSubTab === 'chat' && (
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 overflow-hidden shadow-xs flex flex-col h-[550px]">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <MessageCircle size={16} />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  Trip Crew Discussion
                </h3>
                <p className="text-[10px] text-slate-400">
                  {collaborators.length} active travelers coordinating schedule
                </p>
              </div>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <MessageCircle size={32} className="opacity-40" />
                <p className="text-xs">No messages yet. Send a note to coordinate your travel plans!</p>
              </div>
            ) : (
              messages.map((m) => {
                const currentUserId = user?.id || 'demo-user';
                const isMe = m.senderId === currentUserId;

                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}
                  >
                    <img
                      src={m.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={m.senderName}
                      className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div
                      className={`max-w-[75%] rounded-2xl p-3 text-xs space-y-0.5 ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] opacity-80 font-bold">
                        <span>{isMe ? 'You' : m.senderName}</span>
                        <span>{m.timestamp}</span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input Form */}
          <form onSubmit={handleSendChat} className="p-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Message your travel companions..."
              className="flex-1 px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={sendingMsg || !chatInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-sm"
            >
              <Send size={14} />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: ATTACHED BOOKINGS (MiVoyage Feature)                */}
      {/* ========================================================= */}
      {activeSubTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800/80 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700">
            <div>
              <h2 className="text-lg font-display font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Plane size={20} className="text-blue-600" />
                <span>Synchronized Bookings & Reservations</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Keep all confirmed flight tickets, hotel reservations, and transport vouchers consolidated inside this trip.
              </p>
            </div>

            <button
              onClick={() => setShowBookingModal(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-500/20 shrink-0"
            >
              <Plus size={15} />
              <span>Attach Booking</span>
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-white dark:bg-slate-800/60 p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
              <Plane size={36} className="mx-auto text-blue-500 opacity-60" />
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">No bookings attached to this trip</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Search live hotels, flights, or cabs in the Bookings section and link them here, or add your confirmation code manually.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  Add Booking Details
                </button>
                <Link
                  to="/bookings"
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs"
                >
                  Browse Live Bookings
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map((bk) => (
                <div
                  key={bk.id}
                  className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700 space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        {bk.type === 'flight' ? <Plane size={20} /> : <Building size={20} />}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md capitalize">
                          {bk.type}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1">
                          {bk.title}
                        </h3>
                        <p className="text-xs text-slate-500">{bk.provider}</p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle size={10} />
                      <span>Confirmed</span>
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-700/60 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Confirmation Ref:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{bk.referenceNumber}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Date:</span>
                      <span className="font-semibold">{bk.date}</span>
                    </div>
                    {bk.details && (
                      <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                        {bk.details}
                      </p>
                    )}
                  </div>

                  {bk.amount > 0 && (
                    <div className="text-right text-xs font-bold text-slate-800 dark:text-slate-200">
                      Total: {bk.currency} {bk.amount}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: INVITE COLLABORATOR                                */}
      {/* ========================================================= */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white">
                  Invite Travel Companion
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Plan, vote, and coordinate together on {trip.name}
                </p>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Share Code */}
            {trip.inviteCode && (
              <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Group Invite Code
                  </div>
                  <div className="font-mono font-black text-sm text-slate-900 dark:text-white mt-0.5">
                    {trip.inviteCode}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyInviteCode}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs hover:bg-blue-700"
                >
                  {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Friend's Name *
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Sophie Martin"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. sophie@example.com"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Permission Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="editor">Editor (Can propose, vote, and modify stops)</option>
                  <option value="viewer">Viewer (Can view and cast votes only)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                >
                  {inviting ? 'Inviting...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: PROPOSE ACTIVITY                                   */}
      {/* ========================================================= */}
      {showProposeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white">
                  Propose an Activity
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Suggest a spot for your crew to vote on
                </p>
              </div>
              <button
                onClick={() => setShowProposeModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProposeSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Activity Name *
                </label>
                <input
                  type="text"
                  required
                  value={propName}
                  onChange={(e) => setPropName(e.target.value)}
                  placeholder="e.g. Scuba diving in Grande Island or Sunset dinner"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={propCategory}
                    onChange={(e) => setPropCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="sightseeing">Sightseeing</option>
                    <option value="beach">Beach / Coast</option>
                    <option value="food">Dining & Drinks</option>
                    <option value="adventure">Adventure</option>
                    <option value="culture">Culture & Museum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Day
                  </label>
                  <select
                    value={propDay}
                    onChange={(e) => setPropDay(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    {days.map((d) => (
                      <option key={d.dayNumber} value={d.dayNumber}>
                        Day {d.dayNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Cost ({selectedCurrency})
                </label>
                <input
                  type="number"
                  min={0}
                  value={propCost}
                  onChange={(e) => setPropCost(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Why you recommend it
                </label>
                <textarea
                  rows={2}
                  value={propDesc}
                  onChange={(e) => setPropDesc(e.target.value)}
                  placeholder="e.g. Rated 4.9 on maps, sunset is spectacular from the terrace..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProposeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={proposing}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                >
                  {proposing ? 'Proposing...' : 'Submit Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ATTACH BOOKING                                     */}
      {/* ========================================================= */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white">
                  Attach Booking Voucher
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Link reservation details to this trip
                </p>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddBookingSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Booking Type
                </label>
                <select
                  value={bkType}
                  onChange={(e) => setBkType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="hotel">Hotel / Stay</option>
                  <option value="flight">Flight Ticket</option>
                  <option value="transport">Train / Bus / Cab</option>
                  <option value="activity">Activity Ticket</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={bkTitle}
                  onChange={(e) => setBkTitle(e.target.value)}
                  placeholder="e.g. Grand Resort & Spa (3 Nights)"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Provider *
                  </label>
                  <input
                    type="text"
                    required
                    value={bkProvider}
                    onChange={(e) => setBkProvider(e.target.value)}
                    placeholder="e.g. Booking.com / IndiGo"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Confirmation PNR / Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={bkRef}
                    onChange={(e) => setBkRef(e.target.value)}
                    placeholder="e.g. HTL-84729"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={bkDate}
                    onChange={(e) => setBkDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Amount ({selectedCurrency})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={bkAmount}
                    onChange={(e) => setBkAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Room or Seat Numbers
                </label>
                <input
                  type="text"
                  value={bkDetails}
                  onChange={(e) => setBkDetails(e.target.value)}
                  placeholder="e.g. Deluxe Room with breakfast, Seat 12A"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingBooking}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                >
                  {addingBooking ? 'Linking...' : 'Link Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
