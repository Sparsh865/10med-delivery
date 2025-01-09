/* eslint-disable no-unused-vars */
import React, {useRef} from 'react'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'
import Footer from './Footer'


function Layout() {
  const bookingRef = useRef(null);
  const medicineRef = useRef(null);
  const clinicalRef = useRef(null);
  const testimonialRef = useRef(null);

  const sectionRefs = {
    Appointment: bookingRef,
    Medicines: medicineRef,
    Cases: clinicalRef,
    Testimonials: testimonialRef,
  };

  return (
    <>
    <Navbar refs={sectionRefs} />
    <Outlet context={sectionRefs} />
    <Footer/>
      
    </>
  )
}

export default Layout
