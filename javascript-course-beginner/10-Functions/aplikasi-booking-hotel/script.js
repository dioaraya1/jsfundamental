'use strict';

// const { isValidElement } = require('react');

let bookings = [];

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
  const normalizedHotel = hotelName.trim();
  // optional chaining
  return HOTEL_CONFIG[normalizedHotel]?.[roomType] || 0;
}

const checkAvailability = function (
  hotelName,
  checkInDate,
  roomType = 'standard'
) {
  const normalizedHotel = hotelName.trim();
  //! validasi hotel exist
  const hotelConfig = HOTEL_CONFIG[normalizedHotel];
  // cek hotel ada di config atau tidak
  if (!hotelConfig) {
    return {
      available: false,
      error: `Hotel ${hotelName} tidak ditemukan`,
      availableRooms: 0,
      maxRooms: 0,
    };
  }

  const maxRooms = getMaxRooms(normalizedHotel, roomType);
  // hitung booking yang sudah ada
  const activeBookings = bookings.filter(
    b =>
      b.hotelName === normalizedHotel &&
      b.checkInDate === checkInDate &&
      b.roomType === roomType &&
      b.status === 'confirmed'
  );

  const availableRooms = Math.max(0, maxRooms - activeBookings.length);

  return {
    available: availableRooms > 0,
    availableRooms,
    bookedRooms: activeBookings.length,
    maxRooms,
    occupancyPrecentage:
      Math.round((activeBookings.length / maxRooms) * 100) || 0,
  };
};

const createBooking = function (hotelName, options = {}) {
  const {
    roomType = 'standard',
    nights = 1,
    guests = 1,
    checkInDate = new Date().toISOString().split('T')[0],
  } = options;

  const normalizedHotel = hotelName.trim();
  //* VALIDASI INPUT
  if (!HOTEL_CONFIG[normalizedHotel]) {
    throw new Error(`Hotel ${hotelName} tidak ditemukan`);
  }

  if (
    !normalizedHotel ||
    typeof normalizedHotel !== 'string' ||
    normalizedHotel.trim() === ''
  ) {
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

  const maxRooms = getMaxRooms(normalizedHotel, roomType);

  if (maxRooms === 0) {
    throw new Error(
      `Hotel ${normalizedHotel} tidak memiliki tipe kamar ${roomType}`
    );
  }

  //* VALIDASI BUSINESS RULES TAMBAHAN
  if (roomType === 'premium' && nights < 2) {
    throw new Error('Kamar premium minimal 2 malam');
  }

  if (roomType === 'suite' && guests > 4) {
    throw new Error('Kamar suite maksimal 4 tamu');
  }

  const availability = checkAvailability(
    normalizedHotel,
    checkInDate,
    roomType
  );

  if (!availability.available) {
    throw new Error(
      `Kamar ${roomType} sudah penuh. ` +
        `Tersedia: ${availability.availableRooms}/${availability.maxRooms}`
    );
  }

  // check untuk race condition
  const currentBooking = bookings.filter(
    b =>
      b.hotelName === normalizedHotel &&
      b.checkInDate === checkInDate &&
      b.roomType === roomType &&
      b.status === 'confirmed'
  ).length;
  if (currentBooking >= maxRooms) {
    throw new Error(
      `Kamar ${roomType} sudah penuh karena ada booking lain yang masuk secara bersamaan. Silakan coba lagi.`
    );
  }

  // hitung harga
  const roomPrices = {
    standard: 500000,
    deluxe: 800000,
    suite: 1500000,
    premium: 2000000,
  };

  const basePrice = roomPrices[roomType] || roomPrices.standard;
  const totalPrice = basePrice * nights * (guests > 2 ? 1.2 : 1);
  // buat objek booking
  const booking = {
    bookingId: generateBookingId(),
    hotelName: normalizedHotel,
    roomType,
    nights,
    guests,
    checkInDate,
    basePrice,
    totalPrice,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    roomNumber,
  };
  bookings.push(booking);
  return booking;
};

function assignRoomNumber(hotelName, roomType) {
  const roomRanges = {
    'Grand Hotel': {
      standard: { start: 101, end: 104 }, // Kamar 101-104
      deluxe: { start: 201, end: 203 }, // Kamar 201-203
      suite: { start: 301, end: 302 }, // Kamar 301-302
      premium: { start: 401, end: 401 }, // Kamar 401
    },
    'Plaza Hotel': {
      standard: { start: 101, end: 103 },
      deluxe: { start: 201, end: 203 },
      suite: { start: 301, end: 303 },
      premium: { start: 401, end: 401 },
    },
    'Beach Resort': {
      standard: { start: 101, end: 105 },
      deluxe: { start: 201, end: 202 },
      suite: { start: 301, end: 302 },
      premium: { start: 401, end: 401 },
    },
  };
  const range = roomRanges[hotelName]?.[roomType];
  if (!range) {
    return null;
  }
  // cari kamar yang belum terisi
  const usedRoom = bookings
    .filter(b => b.hotelName === hotelName && b.roomType === roomType)
    .map(b => b.roomNumber)
    .filter(Boolean);
  console.log(usedRoom);

  for (let i = range.start; i <= range.end; i++) {
    if (!usedRoom.includes(i)) {
      return i;
    }
  }
  return null;
}

// Contoh penggunaan manual (opsional)
console.log('=== Contoh Penggunaan Manual ===');
bookings = [
  { hotelName: 'Grand Hotel', roomType: 'standard', roomNumber: 101 },
  { hotelName: 'Grand Hotel', roomType: 'standard', roomNumber: 102 },
  { hotelName: 'Grand Hotel', roomType: 'standard', roomNumber: 103 },
  { hotelName: 'Beach Resort', roomType: 'suite', roomNumber: 301 },
];

console.log(
  '1. Grand Hotel - standard:',
  assignRoomNumber('Grand Hotel', 'standard')
);
// console.log(
//   '2. Beach Resort - suite:',
//   assignRoomNumber('Beach Resort', 'suite')
// );
// console.log(
//   '3. Grand Hotel - deluxe:',
//   assignRoomNumber('Grand Hotel', 'deluxe')
// );
