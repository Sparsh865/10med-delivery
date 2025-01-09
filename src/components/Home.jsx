/* eslint-disable no-unused-vars */
'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Menu, X, ShoppingCart, Search, Star, ArrowRight, Calendar, MapPin, Clock, ChevronLeft, ChevronRight, Heart, Share2, MessageCircle, User, Users } from 'lucide-react';
import a1 from "../assets/images/a5.jpg";
import a2 from "../assets/images/a8.jpg";
import a3 from "../assets/images/a9.jpg";
import a5 from "../assets/images/o7.jpg";
import a6 from "../assets/images/o10.jpg";
import a7 from "../assets/images/b6.jpg";
import axios from 'axios';
import toast from 'react-hot-toast';

const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    speciality: "Cardiologist",
    experience: "8 years",
    rating: 4.8,
    availableSlots: ["9:00 AM", "11:00 AM", "2:00 PM"],
    image: a7
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    speciality: "Neurologist",
    experience: "12 years",
    rating: 4.9,
    availableSlots: ["10:00 AM", "1:00 PM", "3:00 PM"],
    image: a7
  },
  {
    id: 3,
    name: "Dr. Emily Patel",
    speciality: "Dermatologist",
    experience: "6 years",
    rating: 4.7,
    availableSlots: ["9:30 AM", "12:00 PM", "2:30 PM"],
    image: a7
  },
];


const testimonials = [
  {
    id: 1,
    name: "John Doe",
    rating: 5,
    comment: "Excellent service and professional staff. Highly recommended!",
    image: a5
  },
  {
    id: 2,
    name: "Jane Smith",
    rating: 4,
    comment: "Great experience overall. The doctors are very knowledgeable and caring.",
    image: a6
  },
  {
    id: 3,
    name: "Robert Johnson",
    rating: 5,
    comment: "The online consultation was seamless and very helpful. Will definitely use again!",
    image: a5
  },
];

export default function Home() {
  const sectionRefs = useOutletContext();
  const { heroRef, bookingRef, medicineRef, clinicalRef, testimonialRef } = sectionRefs;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [filteredMedicines, setFilteredMedicines] = useState(medicines);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [appointmentForm, setAppointmentForm] = useState({
    name: "",
    email: "",
    phone: "",
    problem: "",
    isEmergency: false
  });


  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async (query) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/medicines?search=${query}`);
      setMedicines(response.data);
      setFilteredMedicines(response.data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      fetchMedicines(searchQuery);
    } else {
      setMedicines([]);
      setFilteredMedicines([]);
    }
  }, [searchQuery]);

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const filtered = medicines.filter(medicine =>
      medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.salt.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredMedicines(filtered)
  }, [searchQuery, medicines])

  const scrollTo = (ref) => {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAppointmentSubmit = (e) => {
    e.preventDefault();
    
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    appointments.push({...appointmentForm, id: Date.now(), date: selectedDate});
    localStorage.setItem('appointments', JSON.stringify(appointments));
    
    setAppointmentForm({
      name: "",
      email: "",
      phone: "",
      problem: "",
      isEmergency: false
    });
    setSelectedDate(null);
    alert("Appointment booked successfully!");
  };

  const heroSlides = [
    { id: 1, image: a1, title: 'Advanced Healthcare', subtitle: 'Cutting-edge medical solutions' },
    { id: 2, image: a2, title: 'Expert Doctors', subtitle: 'World-class medical professionals' },
    { id: 3, image: a3, title: 'State-of-the-art Facilities', subtitle: 'Modern equipment for better care' },
  ];

  const rotatingTexts = ["Expert Care", "Advanced Technology", "Compassionate Service"];

const addToCart = async (medicine) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login to add items to cart')
        return
      }
      await axios.post('http://localhost:3000/api/cart', {
        medicineId: medicine._id,
        quantity: 1
      }, {
        headers: { Authorization: token }
      })
      toast.success('Added to cart successfully!')
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add to cart')
    }
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMedicines = filteredMedicines.slice(indexOfFirstItem, indexOfLastItem);

  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white text-gray-800">
      
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-green-500 z-50"
        style={{ scaleX: scrollYProgress }}
      />
      
      <section ref={heroRef} className="relative pt-24 pb-20 overflow-hidden">
        <motion.div 
          className="container mx-auto px-4"
          style={{ opacity, scale }}
        >
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 z-10">
              <motion.h2
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-5xl font-bold mb-6"
              >
                YOUR HEALTH IS <span className="text-green-500">OUR PRIORITY</span>
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl mb-8 h-8"
              >
                <AnimatePresence mode="wait">
                  <motion.p
                    key={rotatingTexts[currentSlide]}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    {rotatingTexts[currentSlide]}
                  </motion.p>
                </AnimatePresence>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="bg-white rounded-full p-2 inline-block"
              >
                <span className="text-3xl font-bold text-green-500">-25%</span>
                <span className="ml-2">for the initial consultation with any specialist for you and your loved ones</span>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 bg-green-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-600 transition-colors"
                onClick={() => scrollTo(bookingRef)}
              >
                BOOK NOW
              </motion.button>
            </div>
            <div className="md:w-1/2 relative mt-10 md:mt-0">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 20,
                  ease: "linear",
                  repeat: Infinity,
                }}
                className="absolute top-0 right-0 w-80 h-80 bg-green-200 rounded-full opacity-50"
              />
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, -180, -360],
                }}
                transition={{
                  duration: 15,
                  ease: "linear",
                  repeat: Infinity,
                }}
                className="absolute  bottom-0 left-0 w-60 h-60 bg-green-300 rounded-full opacity-40"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 overflow-hidden rounded-full w-full h-96"
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentSlide}
                    src={heroSlides[currentSlide].image}
                    alt={heroSlides[currentSlide].title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                <motion.div 
                  className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center p-6 text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-6xl font-bold text-center">{heroSlides[currentSlide].title}</h3>
                  <p className="text-2xl text-center">{heroSlides[currentSlide].subtitle}</p>
                </motion.div>
              </motion.div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex  space-x-2">
                {heroSlides.map((_, index) => (
                  <motion.button
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === currentSlide ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    onClick={() => setCurrentSlide(index)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      
      <section ref={bookingRef} className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center mb-12"
          >
            Book an Appointment in 3 Easy Steps
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Search, title: "Find a Doctor", description: "Search our extensive database of qualified professionals" },
              { icon: Calendar, title: "Choose a Date", description: "Select a convenient time from available slots" },
              { icon: User, title: "Book Appointment", description: "Confirm your booking with a few simple clicks" }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-green-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <motion.div 
                  className="flex items-center space-x-4 mb-4"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="bg-green-500 text-white p-3 rounded-full">
                    <step.icon size={24} />
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                </motion.div>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center mb-12"
          >
            Book Your Appointment
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="grid gap-8">
              {doctors.map((doctor, index) => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="flex items-center">
                    <img src={doctor.image} alt={doctor.name} className="w-20 h-20 object-cover rounded-full mr-4" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{doctor.name}</h3>
                      <p className="text-gray-600 mb-2">{doctor.speciality}</p>
                      <div className="flex items-center">
                        <Star className="text-yellow-400 mr-1" size={16} />
                        <span>{doctor.rating}</span>
                      </div>
                    </div>
                  </div>
                  <h4 className="font-semibold mt-4 mb-2">Available Slots:</h4>
                  <div className="flex flex-wrap gap-2">
                    {doctor.availableSlots.map((slot) => (
                      <motion.button
                        key={slot}
                        onClick={() => setSelectedDate(slot)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedDate === slot
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {slot}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-xl shadow-lg"
            >
              <h3 className="text-2xl font-bold mb-4">Book Your Appointment</h3>
              <form onSubmit={handleAppointmentSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={appointmentForm.name}
                    onChange={(e) => setAppointmentForm({...appointmentForm, name: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={appointmentForm.email}
                    onChange={(e) => setAppointmentForm({...appointmentForm, email: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    value={appointmentForm.phone}
                    onChange={(e) => setAppointmentForm({...appointmentForm, phone: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="problem" className="block text-sm font-medium text-gray-700">Describe your problem</label>
                  <textarea
                    id="problem"
                    value={appointmentForm.problem}
                    onChange={(e) => setAppointmentForm({...appointmentForm, problem: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={appointmentForm.isEmergency}
                      onChange={(e) => setAppointmentForm({...appointmentForm, isEmergency: e.target.checked})}
                      className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">This is an emergency</span>
                  </label>
                </div>
                <div className="mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Book Appointment
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </section>


      <section ref={medicineRef} className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center mb-12"
          >
            Find Your Medicines
          </motion.h2>
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search medicines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="flex justify-center space-x-4 mb-8">
            {/* {["All", "Pain Relief", "Antibiotics", "Gastrointestinal"].map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === category
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </motion.button>
            ))} */}
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {currentMedicines.map((medicine, index) => (
              <motion.div
                key={medicine.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all border"
              >
                <img src={medicine.image} alt={medicine.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                <h3 className="text-xl font-semibold mb-2">{medicine.name}</h3>
                <p className="text-gray-600 mb-2">{medicine.description}</p>
                <p className="text-green-500 font-semibold mb-4">₹{medicine.price}</p>
                <p className="text-sm text-gray-500 mb-1">Mfg: {new Date(medicine.manufacturing).toLocaleDateString()}</p>
                <p className="text-sm text-gray-500 mb-4">Exp: {new Date(medicine.expiry).toLocaleDateString()}</p>
                <div className="flex justify-between items-center">
                  <motion.button
                    onClick={() => setSelectedMedicine(medicine)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-green-500 hover:underline"
                  >
                    View Details
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => addToCart(medicine)}
                    className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
                  >
                    <ShoppingCart size={20} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
          
          {filteredMedicines.length > itemsPerPage && (
            <div className="flex justify-center mt-8">
              {Array.from({ length: Math.ceil(filteredMedicines.length / itemsPerPage) }, (_, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => paginate(i + 1)}
                  className={`mx-1 px-3 py-1 rounded ${
                    currentPage === i + 1 ? 'bg-green-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  {i + 1}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </section>

      
      <section ref={clinicalRef} className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold mb-2 text-center"
          >
            Complex Clinical Cases
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-600 mb-12 text-center"
          >
            Get specialized treatment from our experts
          </motion.p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Advanced Diagnostics",
                description: "Cutting-edge technology for accurate diagnosis",
                icon: Search,
                color: "bg-purple-100"
              },
              {
                title: "Personalized Treatment",
                description: "Tailored care plans for complex conditions",
                icon: User,
                color: "bg-green-100"
              },
              {
                title: "Multidisciplinary Approach",
                description: "Collaborative care from various specialists",
                icon: Users,
                color: "bg-orange-100"
              }
            ].map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ scale: 1.05 }}
                className={`${service.color} p-6 rounded-xl hover:shadow-lg transition-all`}
              >
                <motion.div 
                  className="flex items-center mb-4"
                  whileHover={{ x: 5 }}
                >
                  <div className="bg-white p-2 rounded-full mr-4">
                    <service.icon className="text-green-500" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold">{service.title}</h3>
                </motion.div>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <motion.button
                  whileHover={{ x: 5 }}
                  className="flex items-center text-green-500"
                >
                  Learn More <ArrowRight className="ml-2" size={16} />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      
      <section ref={testimonialRef} className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center mb-12"
          >
            What Our Patients Say
          </motion.h2>
          <div className="relative">
            <div className="flex overflow-x-hidden">
              <motion.div
                className="flex"
                animate={{ x: `-${activeTestimonial * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.id}
                    className="min-w-full bg-gray-50 p-6 rounded-xl shadow-sm mx-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex items-center mb-4">
                      <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                      <div>
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <div className="flex text-yellow-400">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} size={16} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600">{testimonial.comment}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            <div className="flex justify-center mt-4">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  className={`w-3 h-3 rounded-full mx-1 ${
                    index === activeTestimonial ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  onClick={() => setActiveTestimonial(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      <AnimatePresence>
        {selectedMedicine && (
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedMedicine(null)}
        >
             <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold">{selectedMedicine.name}</h3>
                <button onClick={() => setSelectedMedicine(null)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <img src={selectedMedicine.image} alt={selectedMedicine.name} className="w-full h-48 object-cover rounded-lg mb-4" />
              <div className="space-y-2 mb-6">
                <p><span className="font-semibold">Salt:</span> {selectedMedicine.salt}</p>
                <p><span className="font-semibold">Company:</span> {selectedMedicine.company}</p>
                <p><span className="font-semibold">Price:</span> ₹{selectedMedicine.price}</p>
                <p><span className="font-semibold">Mfg Date:</span> {new Date(selectedMedicine.manufacturing).toLocaleDateString()}</p>
                <p><span className="font-semibold">Exp Date:</span> {new Date(selectedMedicine.expiry).toLocaleDateString()}</p>
                <p className="text-gray-600">{selectedMedicine.description}</p>
              </div>
              <div className="flex justify-between">
              <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addToCart(selectedMedicine)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Add to Cart
                </motion.button>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-gray-200 p-2 rounded-full"
                  >
                    <Heart size={20} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-gray-200 p-2 rounded-full"
                  >
                    <Share2 size={20} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

