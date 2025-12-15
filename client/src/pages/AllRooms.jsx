import React, {useState} from 'react'
import { assets, facilityIcons, roomsDummyData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import StartRating from '../components/StarRating'

const CheckBox = ({ label, selected = false, onChange = () => { } }) => {
        return (
            <label className='flex gap-3 items-center cursor-pointer mt-2 text-sm'>
                <input type="checkbox" checked={selected} onChange={(e)=>onChange(e.target.checked, label)}/>
                <span className='font-light select-none'>{label}</span>
            </label>
        )
}

const RadioButton = ({ label, selected = false, onChange = () => { } }) => {
        return (
            <label className='flex gap-3 items-center cursor-pointer mt-2 text-sm'>
                <input type="radio" checked={selected} onChange={(e)=>onChange(label)}/>
                <span className='font-light select-none'>{label}</span>
            </label>
        )
}

const roomType = ['Single', 'Double', 'Suite', 'Deluxe', 'Family'];
const priceRange = ['Under $100', '$100 - $200', '$200 - $300', '$300 - $400', 'Above $400'];
const sortOptions = ['Price: Low to High', 'Price: High to Low', 'Rating', 'Popularity'];


const AllRooms = () => {
    const navigate = useNavigate();
    const [openFilter, setOpenFilter] = useState(false);
    return (
        <div className='flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32'>
            <div>
                <div className='flex flex-col items-start text-left'>
                    <h1 className='font-playfair text-4xl md:text-[40px]'>Hotel Rooms</h1>
                    <p className='text-sm md:text-base text-gray-500/90 mt-2 max-w-174'>Take advantage of our limited-time offers and special packages to enhace your stay and create unforgettable memories.</p>
                </div>

                {roomsDummyData.map((room) => (
                    <div key={room._id} className='flex flex-col md:flex-row items-start py-10 gap-6 border-b border-gray-300 last:pb-30 last:border-0'>
                        <img onClick={() => { navigate(`/rooms/${room._id}`); scrollTo(0, 0); }}
                            src={room.images[0]} alt='hotel-img' title='View Room Details'
                            className='max-h-65 md:w-1/2 rounded-xl shadow-lg object-cover cursor-pointer' />

                        <div className='md:w-1/2 flex flex-col gap-2'>
                            <p className='text-gray-500'>{room.hotel.city}</p>
                            <p onClick={() => { navigate(`/rooms/${room._id}`); scrollTo(0, 0) }}
                                className='text-gray-800 text-3xl font-playfair cursor-pointer'>{room.hotel.name}</p>
                            <div className='flex items-center'>
                                <StartRating />
                                <p className='ml-2'>200+ reviews</p>
                            </div>
                            <div className='flex items-center mt-2 gap-1 text-gray-500 text-sm'>
                                <img src={assets.locationIcon} alt="location-icon" />
                                <span className='ml-2 text-gray-500'>{room.hotel.address}</span>
                            </div>
                            {/* room amenities */}
                            <div className='flex items-center gap-1 mt-2 text-gray-500 text-sm'>
                                {room.amenities.map((item, index) => (
                                    <div key={index} className='flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F5F5]/70'>
                                        <img src={facilityIcons[item]} alt={item} className='w-5 h-5'/>
                                        <p className='text-xs'>{item}</p>
                                    </div>
                                 ))}
                            </div>
                            <p className='text-xl font-medium text-gray-700'>${room.pricePerNight}/night</p>
                        </div>
                    </div>
                ))}

            </div>
            { /*filter*/}
            <div className='bg-white w-80 border border-gray-300 text-gray-600 mb-8 lg:mt-16'>

                <div
                    className={`flex items-center justify-between px-5 py-2.5 lg:border-b border-gray-300 ${openFilter ? 'border-b' : ''}`}
                    onClick={() => setOpenFilter(prev => !prev)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpenFilter(prev => !prev) }}
                >
                    <p className='text-base font-medium text-gray-800'>FILTER</p>
                    <div className='text-xs cursor-pointer'>
                        <span className='lg:hidden'>{openFilter ? 'HIDE' : 'SHOW'}</span>
                        <span className='hidden lg:block'>CLEAR</span>
                    </div>
                </div>

                <div className={`${openFilter ? 'h-auto' : 'h-0 lg:h-auto'} overflow-hidden transition-all duration-700`}>
                     <div className='px-5 pt-5'>
                        <p className='font-medium text-gray-800 pb-2'>Popular filters</p>
                        {roomType.map((room, index) => (
                            <CheckBox key={index} label={room} />
                        ))}
                     </div>
                        <div className='px-5 pt-5'>
                        <p className='font-medium text-gray-800 pb-2'>Price Range</p>
                        {priceRange.map((range, index) => (
                            <CheckBox key={index} label={range} />
                        ))}
                     </div>
                       <div className='px-5 pt-5 pb-7'>
                        <p className='font-medium text-gray-800 pb-2'>Sort By</p>
                        {sortOptions.map((options, index) => (
                            <RadioButton key={index} label={options} />
                        ))}
                     </div>
                </div>
            </div>
        </div>
    )
}

export default AllRooms
