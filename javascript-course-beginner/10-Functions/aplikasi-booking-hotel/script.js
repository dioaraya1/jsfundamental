'use strict';

const bookings = [];

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

const createBooking = function (
  hotelName,
  {
    roomType = 'standard',
    nights = 1,
    guests = 1,
    checkInDate = new Date().toISOString().split('T')[0],
  } = {}
) {
  if (!hotelName || typeof hotelName !== 'string') {
    throw new Error('nama hotel harus diisi dan berupa teks');
  }

  if (guests < 1 || guests > 4) {
    throw new Error('Jumlah tamu harus antara 1 dan 4');
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
    hotelName,
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
// console.log(randomId);
