/**
 * LuxuryStay HMS – Database Seed Script
 * Run: node backend/seed.js
 * Seeds: staff users, demo rooms, demo services, demo guests
 */

const dotenv = require("dotenv");
dotenv.config({ path: __dirname + "/.env" });

const mongoose = require("mongoose");
const User = require("./models/User");
const Room = require("./models/Room");
const Guest = require("./models/Guest");
const Service = require("./models/Service");
const Settings = require("./models/Settings");

const connectDB = require("./config/db");

const seed = async () => {
  await connectDB();

  console.log("\n🌱 Starting seed...\n");

  // ─── STAFF USERS ──────────────────────────────────────────────
  const staffData = [
    { name: "Alexander Reed",  email: "admin@luxurystay.com",       password: "Admin123!",       role: "Admin" },
    { name: "Sophia Chen",     email: "manager@luxurystay.com",     password: "Manager123!",     role: "Manager" },
    { name: "Marcus Hill",     email: "reception@luxurystay.com",   password: "Reception123!",   role: "Receptionist" },
    { name: "Priya Patel",     email: "housekeeping@luxurystay.com",password: "House123!",       role: "Housekeeping" },
    { name: "David Vance",     email: "maintenance@luxurystay.com", password: "Maint123!",       role: "Maintenance" },
  ];

  for (const staff of staffData) {
    const exists = await User.findOne({ email: staff.email });
    if (!exists) {
      await User.create(staff);
      console.log(`✅ User created: ${staff.email} (${staff.role})`);
    } else {
      console.log(`⏭️  User already exists: ${staff.email}`);
    }
  }

  // ─── ROOMS ────────────────────────────────────────────────────
  const roomsData = [
    { number: "101", type: "Standard",           floor: "1", status: "Available",   pricePerNight: 150, capacity: 2, amenities: "TV, Wi-Fi, Air Conditioning, Mini Fridge" },
    { number: "102", type: "Standard",           floor: "1", status: "Occupied",    pricePerNight: 150, capacity: 2, amenities: "TV, Wi-Fi, Air Conditioning, Mini Fridge" },
    { number: "201", type: "Deluxe",             floor: "2", status: "Available",   pricePerNight: 250, capacity: 2, amenities: "King Bed, TV, Wi-Fi, City View, Bathtub" },
    { number: "202", type: "Deluxe",             floor: "2", status: "Cleaning",    pricePerNight: 250, capacity: 2, amenities: "King Bed, TV, Wi-Fi, City View, Bathtub" },
    { number: "301", type: "Suite",              floor: "3", status: "Available",   pricePerNight: 450, capacity: 3, amenities: "Living Area, Jacuzzi, Ocean View, King Bed, Mini Bar" },
    { number: "302", type: "Suite",              floor: "3", status: "Occupied",    pricePerNight: 450, capacity: 3, amenities: "Living Area, Jacuzzi, Ocean View, King Bed, Mini Bar" },
    { number: "401", type: "Presidential Suite", floor: "4", status: "Available",   pricePerNight: 950, capacity: 4, amenities: "Private Pool, Butler Service, Panoramic View, Full Kitchen" },
    { number: "402", type: "Family Room",        floor: "4", status: "Maintenance", pricePerNight: 320, capacity: 5, amenities: "2 Bedrooms, Kids Zone, Bunk Beds, Large Bathroom" },
    { number: "501", type: "Deluxe",             floor: "5", status: "Available",   pricePerNight: 275, capacity: 2, amenities: "Sea View, King Bed, Bathtub, TV, Wi-Fi" },
    { number: "502", type: "Standard",           floor: "5", status: "Available",   pricePerNight: 150, capacity: 2, amenities: "TV, Wi-Fi, Air Conditioning" },
  ];

  for (const room of roomsData) {
    const exists = await Room.findOne({ number: room.number });
    if (!exists) {
      await Room.create(room);
      console.log(`✅ Room created: #${room.number} (${room.type})`);
    } else {
      console.log(`⏭️  Room already exists: #${room.number}`);
    }
  }

  // ─── GUESTS ───────────────────────────────────────────────────
  const guestsData = [
    { name: "Eleanor Vance",      email: "eleanor.vance@vanguard.com",    phone: "+1 (555) 728-1994", nationality: "American",   loyaltyTier: "Gold",    totalStays: 12, isVIP: true,  preferences: "High floor, ocean view, champagne on arrival" },
    { name: "Lord James Hartley", email: "j.hartley@hartley-estates.co.uk", phone: "+44 20 7946 0193",  nationality: "British",    loyaltyTier: "Platinum",totalStays: 28, isVIP: true,  preferences: "Presidential suite only, strict privacy" },
    { name: "Camille Dubois",     email: "c.dubois@paris-couture.fr",     phone: "+33 1 42 86 47 20",  nationality: "French",     loyaltyTier: "Silver",  totalStays: 5,  isVIP: false, preferences: "Non-smoking, hypoallergenic pillows" },
    { name: "Arjun Mehta",        email: "arjun.mehta@techventures.in",   phone: "+91 98765 43210",    nationality: "Indian",     loyaltyTier: "Standard",totalStays: 2,  isVIP: false, preferences: "Vegetarian meals, quiet room" },
    { name: "Sofia Monteiro",     email: "sofia.m@monteiro-global.com",   phone: "+55 11 9876-5432",   nationality: "Brazilian",  loyaltyTier: "Gold",    totalStays: 9,  isVIP: false, preferences: "Late checkout, spa access" },
  ];

  for (const guest of guestsData) {
    const exists = await Guest.findOne({ email: guest.email });
    if (!exists) {
      await Guest.create(guest);
      console.log(`✅ Guest created: ${guest.name}`);
    } else {
      console.log(`⏭️  Guest already exists: ${guest.name}`);
    }
  }

  // ─── SERVICES ─────────────────────────────────────────────────
  const servicesData = [
    { name: "Airport Transfer (One Way)", category: "Transport",        price: 85,  unit: "per trip",    description: "Luxury sedan airport pickup or drop-off" },
    { name: "In-Room Dining",             category: "Food & Beverage",  price: 0,   unit: "per order",   description: "24/7 gourmet in-room dining service", available: true },
    { name: "Couples Spa Package",        category: "Spa & Wellness",   price: 280, unit: "per session", description: "2-hour couples massage and hydrotherapy session" },
    { name: "Business Center Access",     category: "Business",         price: 50,  unit: "per day",     description: "Private office, high-speed internet, printing" },
    { name: "Laundry & Dry Cleaning",     category: "Laundry",          price: 35,  unit: "per kg",      description: "Same-day laundry and dry cleaning service" },
    { name: "Private Pool Access",        category: "Recreation",       price: 120, unit: "per hour",    description: "Exclusive private pool booking for suite guests" },
    { name: "Babysitting Service",        category: "Other",            price: 45,  unit: "per hour",    description: "Professional childcare by certified staff" },
    { name: "Michelin Star Dining",       category: "Food & Beverage",  price: 200, unit: "per person",  description: "Exclusive reservation at Le Ciel restaurant" },
  ];

  for (const service of servicesData) {
    const exists = await Service.findOne({ name: service.name });
    if (!exists) {
      await Service.create(service);
      console.log(`✅ Service created: ${service.name}`);
    } else {
      console.log(`⏭️  Service already exists: ${service.name}`);
    }
  }

  // ─── SETTINGS ─────────────────────────────────────────────────
  const existingSettings = await Settings.findOne();
  if (!existingSettings) {
    await Settings.create({
      hotelName: "LuxuryStay Hotel",
      tagline: "Where Elegance Meets Comfort",
      address: "1 Ocean Drive, Penthouse Level",
      city: "Miami",
      country: "United States",
      phone: "+1 (305) 867-5309",
      email: "concierge@luxurystay.com",
      currency: "USD",
      currencySymbol: "$",
      checkInTime: "14:00",
      checkOutTime: "12:00",
      taxRate: 10,
    });
    console.log("✅ Settings initialized");
  } else {
    console.log("⏭️  Settings already exist");
  }

  console.log("\n🏨 Seed complete! LuxuryStay HMS is ready.\n");
  console.log("Staff Login Credentials:");
  console.log("  Admin:       admin@luxurystay.com       / Admin123!");
  console.log("  Manager:     manager@luxurystay.com     / Manager123!");
  console.log("  Receptionist:reception@luxurystay.com   / Reception123!");
  console.log("  Housekeeping:housekeeping@luxurystay.com / House123!");
  console.log("  Maintenance: maintenance@luxurystay.com  / Maint123!\n");

  mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
