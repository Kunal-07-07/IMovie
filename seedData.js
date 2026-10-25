const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: __dirname + '/../.env' });

const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies_db';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Movie.deleteMany();
    await Theatre.deleteMany();
    await Show.deleteMany();
    await Seat.deleteMany();
    await Booking.deleteMany();
    await Payment.deleteMany();
    await Notification.deleteMany();

    console.log('Cleared existing collections.');

    // 1. Seed Users (pre-save hook in User model will hash password once)
    const adminUser = await User.create({
      name: 'IMovies Admin',
      email: 'admin@imovies.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 99887 76655',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
    });

    const demoUser = await User.create({
      name: 'Kunal Sharma',
      email: 'user@imovies.com',
      password: 'user123',
      role: 'user',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'
    });

    console.log('Users created: admin@imovies.com & user@imovies.com');

    // 2. Seed Movies
    const moviesData = [
      {
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
        genres: ['Action', 'Adventure', 'Sci-Fi'],
        language: 'English',
        duration: 166,
        releaseDate: new Date('2024-03-01'),
        rating: 8.8,
        votesCount: 34200,
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        director: 'Denis Villeneuve',
        cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem', 'Austin Butler'],
        formats: ['IMAX 3D', '2D', '4DX'],
        status: 'now_showing'
      },
      {
        title: 'Oppenheimer',
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring the deep moral dilemmas and historical consequences.',
        genres: ['Biography', 'Drama', 'History'],
        language: 'English',
        duration: 180,
        releaseDate: new Date('2023-07-21'),
        rating: 8.9,
        votesCount: 48900,
        posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
        director: 'Christopher Nolan',
        cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.', 'Florence Pugh'],
        formats: ['IMAX 3D', '2D'],
        status: 'now_showing'
      },
      {
        title: 'Spider-Man: Across the Spider-Verse',
        description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
        genres: ['Animation', 'Action', 'Adventure'],
        language: 'English',
        duration: 140,
        releaseDate: new Date('2023-06-02'),
        rating: 8.7,
        votesCount: 29500,
        posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
        director: 'Joaquim Dos Santos, Kemp Powers',
        cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Daniel Kaluuya'],
        formats: ['3D', '2D', '4DX'],
        status: 'now_showing'
      },
      {
        title: 'Interstellar',
        description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans across the far reaches of space and time.',
        genres: ['Adventure', 'Drama', 'Sci-Fi'],
        language: 'English',
        duration: 169,
        releaseDate: new Date('2014-11-07'),
        rating: 8.7,
        votesCount: 52000,
        posterUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        director: 'Christopher Nolan',
        cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
        formats: ['IMAX 3D', '2D'],
        status: 'now_showing'
      },
      {
        title: 'The Dark Knight',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        genres: ['Action', 'Crime', 'Drama'],
        language: 'English',
        duration: 152,
        releaseDate: new Date('2008-07-18'),
        rating: 9.0,
        votesCount: 65000,
        posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
        director: 'Christopher Nolan',
        cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine', 'Gary Oldman'],
        formats: ['2D', 'IMAX 3D'],
        status: 'now_showing'
      },
      {
        title: 'Avatar: The Way of Water',
        description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na\'vi race to protect their home.',
        genres: ['Action', 'Adventure', 'Fantasy'],
        language: 'English',
        duration: 192,
        releaseDate: new Date('2022-12-16'),
        rating: 7.6,
        votesCount: 31000,
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
        director: 'James Cameron',
        cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver', 'Stephen Lang'],
        formats: ['IMAX 3D', '3D', '4DX'],
        status: 'now_showing'
      }
    ];

    const insertedMovies = await Movie.insertMany(moviesData);
    console.log(`Inserted ${insertedMovies.length} movies.`);

    // 3. Seed Theatres
    const theatresData = [
      {
        name: 'PVR ICON: Infiniti Mall',
        city: 'Mumbai',
        location: 'Andheri West',
        address: 'Infiniti Mall, Link Road, Andheri West, Mumbai, Maharashtra 400053',
        totalScreens: 6,
        facilities: ['Dolby Atmos', '4DX', 'Food Lounge', 'Valet Parking', 'Recliner Seats'],
        contactPhone: '+91 22 6677 8899'
      },
      {
        name: 'INOX Megaplex: Phoenix Palladium',
        city: 'Mumbai',
        location: 'Lower Parel',
        address: 'Phoenix Palladium, Senapati Bapat Marg, Lower Parel, Mumbai, Maharashtra 400013',
        totalScreens: 8,
        facilities: ['IMAX Laser', 'Dolby Atmos', 'MX4D', 'Gourmet Kitchen'],
        contactPhone: '+91 22 4333 5500'
      },
      {
        name: 'PVR Director’s Cut: Ambience Mall',
        city: 'Delhi NCR',
        location: 'Vasant Kunj',
        address: 'Ambience Mall, Nelson Mandela Marg, Vasant Kunj, New Delhi 110070',
        totalScreens: 5,
        facilities: ['VIP Recliners', 'Sushi & Tapas Bar', 'Personal Concierge', 'Dolby 7.1'],
        contactPhone: '+91 11 4087 0000'
      },
      {
        name: 'Cinepolis VIP: Forum Mall',
        city: 'Bengaluru',
        location: 'Koramangala',
        address: 'The Forum Mall, Hosur Road, Koramangala, Bengaluru, Karnataka 560095',
        totalScreens: 7,
        facilities: ['VIP Recliners', 'Dolby Atmos', 'Cafe Coffee Day Lounge'],
        contactPhone: '+91 80 2206 7800'
      }
    ];

    const insertedTheatres = await Theatre.insertMany(theatresData);
    console.log(`Inserted ${insertedTheatres.length} theatres.`);

    // 4. Seed Shows & Seats
    // Get today's and upcoming dates formatted as YYYY-MM-DD
    const today = new Date();
    const dates = [];
    for (let i = 0; i < 4; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const showTimes = ['10:30 AM', '02:00 PM', '06:15 PM', '09:45 PM'];

    const rowsSetup = [
      { row: 'A', tier: 'VIP', price: 450 },
      { row: 'B', tier: 'VIP', price: 450 },
      { row: 'C', tier: 'Premium', price: 320 },
      { row: 'D', tier: 'Premium', price: 320 },
      { row: 'E', tier: 'Premium', price: 320 },
      { row: 'F', tier: 'Premium', price: 320 },
      { row: 'G', tier: 'Standard', price: 220 },
      { row: 'H', tier: 'Standard', price: 220 }
    ];

    let totalShowsCount = 0;

    for (const movie of insertedMovies) {
      for (const theatre of insertedTheatres) {
        // Create 2 shows per theatre per movie for dates[0] and dates[1]
        for (const dateStr of [dates[0], dates[1]]) {
          for (let t = 0; t < 2; t++) {
            const time = showTimes[(totalShowsCount + t) % showTimes.length];
            const show = await Show.create({
              movie: movie._id,
              theatre: theatre._id,
              screenName: `Screen ${t + 1} - 4K Laser`,
              showDate: dateStr,
              showTime: time,
              format: movie.formats[0] || '2D',
              language: movie.language,
              pricing: { vip: 450, premium: 320, standard: 220 },
              totalSeats: 64,
              availableSeatsCount: 60
            });

            // Generate 64 seats
            const seatsList = [];
            rowsSetup.forEach((r) => {
              for (let col = 1; col <= 8; col++) {
                // Pre-mark 2-3 seats as booked for realistic visual
                const isBooked = (r.row === 'C' && (col === 4 || col === 5)) || (r.row === 'B' && col === 3);
                seatsList.push({
                  show: show._id,
                  seatNumber: `${r.row}${col}`,
                  row: r.row,
                  col: col,
                  tier: r.tier,
                  price: r.price,
                  status: isBooked ? 'booked' : 'available'
                });
              }
            });

            await Seat.insertMany(seatsList);
            totalShowsCount++;
          }
        }
      }
    }

    console.log(`Successfully generated ${totalShowsCount} shows and complete seat matrices!`);

    // 5. Seed a sample past booking for demoUser
    const sampleShow = await Show.findOne().populate('movie').populate('theatre');
    if (sampleShow) {
      const sampleBooking = await Booking.create({
        bookingId: 'IMV-2026-889124',
        user: demoUser._id,
        show: sampleShow._id,
        movie: sampleShow.movie._id,
        theatre: sampleShow.theatre._id,
        seats: ['C4', 'C5'],
        seatDetails: [
          { seatNumber: 'C4', tier: 'Premium', price: 320 },
          { seatNumber: 'C5', tier: 'Premium', price: 320 }
        ],
        snacks: [{ name: 'Caramel Popcorn & Coke Combo', quantity: 1, price: 290 }],
        subtotal: 930,
        convenienceFee: 50,
        tax: 167,
        totalAmount: 1147,
        status: 'confirmed',
        qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=IMOVIES-TICKET|IMV-2026-889124'
      });

      const samplePayment = await Payment.create({
        booking: sampleBooking._id,
        user: demoUser._id,
        amount: 1147,
        paymentMethod: 'UPI',
        transactionId: 'TXN-IMV-987123456',
        status: 'success'
      });

      sampleBooking.payment = samplePayment._id;
      await sampleBooking.save();

      await Notification.create({
        user: demoUser._id,
        title: 'Booking Confirmed!',
        message: `Welcome to IMovies! Your booking for ${sampleShow.movie.title} is confirmed. Booking ID: IMV-2026-889124`,
        type: 'booking'
      });
    }

    console.log('Database seeded successfully! Exiting.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
