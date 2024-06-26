"use client"

import React, { useEffect, useState } from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import getReservations from '@/libs/getReservations';
import styles from './page.module.css'
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface ReservationItem {
    user: {
        email: string
    },
    datetime: string,
    _id: string,
    count: number
}

function MyReservationforOwnerPage({ params }: { params: { rid: string } }) {
    const [reservationList, setReservationList] = useState<ReservationItem[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await getReservations({ rid: params.rid });
            if (response && response.data) {
                setReservationList(response.data);
            } else {
                setReservationList([]);
            }
        } catch (error) {
            console.log('Error fetching reservations:', error);
            setReservationList([]);
        }
    };

    const isExpired = (dateTimeString: string) => {
        const dateTime = new Date(dateTimeString);
        return dateTime < new Date(); // Check if reservation datetime is less than current datetime
    };

    // Function to format the booking date to show only the date part
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const options = { day: '2-digit' as const, month: '2-digit' as const, year: 'numeric' as const };
        return date.toLocaleDateString(undefined, options);
    };

    // Function to format the booking time to show only the time part
    const formatTime = (dateTimeString: string) => {
        const dateTime = new Date(dateTimeString);
        const options = { hour: '2-digit' as const, minute: '2-digit' as const };
        return dateTime.toLocaleTimeString(undefined, options);
    };

    const sortedReservationList = (reservationList)
        ? reservationList.sort((a, b) => {
            const aDateTime = new Date(a.datetime).getTime();
            const bDateTime = new Date(b.datetime).getTime();
            const currentDateTime = new Date().getTime();

            if (aDateTime < currentDateTime && bDateTime >= currentDateTime) {
                return 1;
            } else if (bDateTime < currentDateTime && aDateTime >= currentDateTime) {
                return -1;
            } else {
                return aDateTime - bDateTime;
            }
        })
        : reservationList;

    return (
        <>
            <div>
                <p className='text-center text-gray-600 text-[36px] md:text-[48px] py-6'>My reservation</p>
                
                <div className='flex flex-col items-center'>
                    {!reservationList ? (
                        <div className={styles.card}>
                            <p className='font-semibold mt-1'>Reservation history is empty.</p>
                        </div>
                    ) : (
                        sortedReservationList.map((reservation) => (
                            <div key={reservation._id} className='relative'>
                                {
                                    isExpired(reservation.datetime) ?
                                    <div className='flex flex-col items-center absolute top-[35%] left-[140px] z-30'>
                                    <p className='text-[28px] font-semibold'>Reservation has expired!!</p>
                                    </div> : ''
                                }
                                <div key={reservation._id} className={isExpired(reservation.datetime) ? styles.expiredCard : styles.card}>
                                    <div className='flex flex-row justify-between'>
                                        <div className='flex flex-row items-center'>
                                            <PersonIcon />
                                            <div className={styles.information}>{reservation.user.email}</div>
                                        </div>
                                    </div>
                                    <div className='flex flex-row items-center'>
                                        <CalendarMonthIcon />
                                        <div className={styles.information}>{formatDate(reservation.datetime)}</div>
                                    </div>
                                    <div className='flex flex-row items-center'>
                                        <AccessTimeIcon />
                                        <div className={styles.information}>{formatTime(reservation.datetime)}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}

export default MyReservationforOwnerPage;
