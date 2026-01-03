'use strict';

const { isValidElement } = require('react');

const bookings = [];

const HOTEL_CONFIG = {
  'Grand Hotel': {
    standard: 4, // Kamar 1-4: Standard
    deluxe: 3, // Kamar 5-7: Deluxe
    suite: 2, // Kamar 8-9: Suite
    premium: 1, // Kamar 10: Premium
  },
  'Plaza Hotel': {
    standard: 3,
    deluxe: 3,
    suite: 3,
    premium: 1,
  },
  'Beach Resort': {
    standard: 5,
    deluxe: 2,
    suite: 2,
    premium: 1,
  },
};

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

function generateBookingId() {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `HOTEL${timestamp}${randomId}`;
}

function getMaxRooms(hotelName, roomType) {
  const normailizedHotel = hotelName.trim();
  return HOTEL_CONFIG[normailizedHotel]?.[roomType] || 0;
}

const createBooking = function (hotelName, options = {}) {
  const {
    roomType = 'standard',
    nights = 1,
    guests = 1,
    checkInDate = new Date().toISOString().split('T')[0],
  } = options;

  if (!hotelName || typeof hotelName !== 'string' || hotelName.trim() === '') {
    throw new Error('nama hotel harus diisi dan berupa teks');
  }

  if (!Number.isInteger(guests) || guests < 1 || guests > 4) {
    throw new Error('Jumlah tamu harus antara 1 dan 4');
  }

  if (!Number.isInteger(nights) || nights < 1 || nights > 30) {
    throw new Error('Jumlah malam harus 1-30');
  }

  const today = new Date().toISOString().split('T')[0];
  if (!isValidDate(checkInDate)) {
    throw new Error('format tanggal tidak valid');
  }
  if (checkInDate < today) {
    throw new Error('Tanggal check-in tidak boleh masa lalu');
  }

  const validRoomTypes = ['standard', 'deluxe', 'suite', 'premium'];

  if (!validRoomTypes.includes(roomType))
    throw new Error('tipe kamar tidak valid');

  //* VALIDASI BUSINESS RULES TAMBAHAN
  if (roomType === 'premium' && nights < 2) {
    throw new Error('Kamar premium minimal 2 malam');
  }

  if (roomType === 'suite' && guests > 3) {
    throw new Error('Kamar suite maksimal 3 tamu');
  }

  const roomPrices = {
    standard: 500000,
    deluxe: 800000,
    suite: 1500000,
    premium: 2000000,
  };

  const basePrice = roomPrices[roomType] || roomPrices.standard;
  const totalPrice = basePrice * nights * (guests > 2 ? 1.2 : 1);

  const booking = {
    bookingId: generateBookingId(),
    hotelName: hotelName.trim(),
    roomType,
    nights,
    guests,
    checkInDate,
    totalPrice,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  bookings.push(booking);
  return booking;
};

const checkAvailability = function (hotelName, checkInDate, roomType) {
  const normalizedHotel = hotelName.trim();
  //! validasi hotel exist
  const hotelConfig = HOTEL_CONFIG[normalizedHotel];
  if (!hotelConfig) {
    throw new Error(`hotel ${hotelName} tidak ditemukan`);
  }

  const maxRooms = hotelConfig.currentAllLocation[roomType] || 0;

  const conflictingBookings = bookings.filter(
    booking =>
      booking.hotelName.toLowerCase() === hotelName &&
      booking.checkInDate === checkInDate &&
      booking.roomType.toLowerCase() === roomType &&
      booking.status !== 'cancelled'
  );
  const availableRooms = Math.max(0, maxRooms - conflictingBookings.length);

  return { available: availableRooms > 0 };
};
// console.log(randomId);
