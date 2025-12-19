import { useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import React from 'react'
import toast from 'react-hot-toast';

const Loader = () => {
    const { navigate, axios, getToken } = useAppContext();
    const { nextUrl } = useParams();

    const verifyPayment = async (bookingId) => {
        try {
            const { data } = await axios.post('/api/bookings/verify-payment', 
                { bookingId }, 
                { headers: { Authorization: `Bearer ${await getToken()}` } }
            );
            if (data.success) {
                toast.success('Payment verified successfully!');
                localStorage.removeItem('pendingBookingId');
            }
        } catch (error) {
            toast.error('Payment verification failed');
        }
    };

    React.useEffect(() => {
        const bookingId = localStorage.getItem('pendingBookingId');
        
        const handleRedirect = async () => {
            if (bookingId) {
                await verifyPayment(bookingId);
            }
            
            if (nextUrl) {
                setTimeout(() => {
                    navigate(`/${nextUrl}`);
                }, 2000);
            }
        };
        
        handleRedirect();
    }, [nextUrl]);

    return (
        <div className='flex justify-center items-center h-screen'>
            <div className="animate-spin rounded-full h-24 w-24 border-4 border-gray-300 border-t-blue-600"></div>      
        </div>
    )
}

export default Loader
