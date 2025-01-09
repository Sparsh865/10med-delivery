/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
'use client'

import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Smartphone, Building2, ChevronLeft, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'

const PaymentMethod = ({ icon: Icon, name, selected, onSelect }) => (
  <div
    className={`flex items-center p-4 border rounded-lg cursor-pointer ${
      selected ? 'border-green-500 bg-blue-50' : 'border-gray-200'
    }`}
    onClick={onSelect}
  >
    <Icon className={`mr-3 ${selected ? 'text-blue-500' : 'text-gray-400'}`} />
    <span className={selected ? 'text-blue-500 font-semibold' : 'text-gray-700'}>{name}</span>
    {selected && <Check className="ml-auto text-blue-500" />}
  </div>
)

export default function Payment() {
  const location = useLocation()
  const navigate = useNavigate()
  const { totalCost = 0 } = location.state || {}
  const [paymentMethod, setPaymentMethod] = useState('')
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  })
  const [upiId, setUpiId] = useState('')
  const [bankAccount, setBankAccount] = useState({
    number: '',
    ifsc: '',
    name: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handlePayment = async (e) => {
    e.preventDefault()
    setIsProcessing(true)
    
    try {
      const token = localStorage.getItem('token')
      await axios.post('http://localhost:3000/api/orders', {}, {
        headers: { Authorization: token }
      })
      
      setIsProcessing(false)
      setIsSuccess(true)
      
      setTimeout(() => {
        toast.success('Payment successful!')
        navigate('/')
      }, 2000)
    } catch (error) {
      console.error('Error processing payment:', error)
      setIsProcessing(false)
      toast.error('Payment failed')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Payment</h1>
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Payment Method</h2>
          <div className="space-y-3">
            <PaymentMethod
              icon={CreditCard}
              name="Credit/Debit Card"
              selected={paymentMethod === 'card'}
              onSelect={() => setPaymentMethod('card')}
            />
            <PaymentMethod
              icon={Smartphone}
              name="UPI"
              selected={paymentMethod === 'upi'}
              onSelect={() => setPaymentMethod('upi')}
            />
            <PaymentMethod
              icon={Building2}
              name="Net Banking"
              selected={paymentMethod === 'netbanking'}
              onSelect={() => setPaymentMethod('netbanking')}
            />
          </div>
        </div>

        <AnimatePresence>
          {paymentMethod === 'card' && (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handlePayment}
              className="space-y-4"
            >
              <input
                type="text"
                placeholder="Card Number"
                className="w-full p-2 border rounded"
                value={cardDetails.number}
                onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Name on Card"
                className="w-full p-2 border rounded"
                value={cardDetails.name}
                onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                required
              />
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Expiry (MM/YY)"
                  className="w-1/2 p-2 border rounded"
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="CVV"
                  className="w-1/2 p-2 border rounded"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-300"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Pay ₹${totalCost}`}
              </button>
            </motion.form>
          )}

          {paymentMethod === 'upi' && (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handlePayment}
              className="space-y-4"
            >
              <input
                type="text"
                placeholder="UPI ID"
                className="w-full p-2 border rounded"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-300"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Pay ₹${totalCost}`}
              </button>
            </motion.form>
          )}

          {paymentMethod === 'netbanking' && (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handlePayment}
              className="space-y-4"
            >
              <input
                type="text"
                placeholder="Account Number"
                className="w-full p-2 border rounded"
                value={bankAccount.number}
                onChange={(e) => setBankAccount({ ...bankAccount, number: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="IFSC Code"
                className="w-full p-2 border rounded"
                value={bankAccount.ifsc}
                onChange={(e) => setBankAccount({ ...bankAccount, ifsc: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Account Holder Name"
                className="w-full p-2 border rounded"
                value={bankAccount.name}
                onChange={(e) => setBankAccount({ ...bankAccount, name: e.target.value })}
                required
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-300"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Pay ₹${totalCost}`}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 text-center"
          >
            <Check className="mx-auto text-green-500 w-16 h-16" />
            <h2 className="text-2xl font-semibold mt-4 mb-2">Payment Successful!</h2>
            <p className="text-gray-600">Thank you for your purchase.</p>
          </motion.div>
        )}

        <button
          onClick={() => navigate('/cart')}
          className="mt-8 flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft className="mr-2" />
          Back to Cart
        </button>
      </div>
    </div>
  )
}

