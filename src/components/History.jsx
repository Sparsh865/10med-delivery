/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import axios from 'axios'
import { ChevronDown, ChevronUp, Search, Filter } from 'lucide-react'

const statusSteps = ['Pending', 'Accepted', 'Packing', 'Shipped','Out for Delivery', 'Delivered', 'Rejected']

const statusColors = {
  'Pending': '#FFA500',
  'Accepted': '#3498db',
  'Packing': '#9b59b6',
  'Shipped': '#e74c3c',
  'Out for Delivery': '#FFFFC3',
  'Delivered': '#2ecc71',
  'Rejected': '#95a5a6'
}

const itemsPerPage = 5

export default function History() {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterAndSortOrders()
  }, [orders, searchTerm, statusFilter, sortConfig])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:3000/api/orders/user', {
        headers: { Authorization: token }
      })
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const filterAndSortOrders = () => {
    let result = orders
    if (searchTerm) {
      result = result.filter(order => 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => item.medicine.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    if (statusFilter !== 'All') {
      result = result.filter(order => order.status === statusFilter)
    }
    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
    setFilteredOrders(result)
    setCurrentPage(1)
  }

  const requestSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredOrders, currentPage])

  const pageCount = Math.ceil(filteredOrders.length / itemsPerPage)

  const OrderCard = ({ order }) => {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="bg-white rounded-lg shadow-lg p-6 mb-6 transform hover:scale-105 transition-all duration-300"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Order #{order._id.slice(-6)}</h3>
          <span className="text-sm text-gray-500">{format(new Date(order.date), 'PPP')}</span>
        </div>
        <div className="mb-4 flex justify-between">
          <p className="text-gray-600">Total: ₹{order.totalAmount}</p>
          <p className="text-gray-600">Items: {order.items.length}</p>
        </div>
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-2">Order Status</h4>
          <div className="flex items-center">
            {statusSteps.map((step, index) => {
              const isCompleted = statusSteps.indexOf(order.status) >= index
              const isCurrent = order.status === step
              return (
                <React.Fragment key={step}>
                  <div className="relative flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                        isCompleted ? 'border-green-500 bg-green-500' : 'border-gray-300'
                      }`}
                    >
                      {isCompleted && (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </motion.div>
                    {isCurrent && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -bottom-6 w-max text-sm font-medium text-green-500"
                      >
                        {step}
                      </motion.div>
                    )}
                  </div>
                  {index < statusSteps.length - 1 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex-1 h-1 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    ></motion.div>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedOrder(order)}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          View Details
        </motion.button>
      </motion.div>
    )
  }

  const OrderDetails = ({ order, onClose }) => {
    if (!order) return null

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 15 }}
          className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold mb-4">Order Details</h2>
          <div className="mb-6 grid grid-cols-2 gap-4">
            <p className="text-gray-600">Order ID: #{order._id}</p>
            <p className="text-gray-600">Date: {format(new Date(order.date), 'PPP')}</p>
            <p className="text-gray-600">Status: <span style={{ color: statusColors[order.status] }}>{order.status}</span></p>
            <p className="text-gray-600">Total Amount: ₹{order.totalAmount}</p>
          </div>
          <h3 className="text-xl font-semibold mb-2">Items</h3>
          <div className="space-y-4 mb-6">
            {order.items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <p className="font-medium">{item.medicine.name}</p>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <p className="font-semibold">₹{item.medicine.price * item.quantity}</p>
              </motion.div>
            ))}
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Delivery Address</h3>
            <p>{order.address.street}</p>
            <p>{order.address.city}, {order.address.state} {order.address.pincode}</p>
            {order.address.nearbyLocation && <p>Nearby: {order.address.nearbyLocation}</p>}
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Payment Information</h3>
            <p>Total Amount: ₹{order.totalAmount}</p>
            <p>Payment Method: {order.paymentMethod}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Close
          </motion.button>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8 text-center"
      >
        Your Order History
      </motion.h1>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border rounded-lg"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <div className="relative">
          <button
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            className="p-2 border rounded-lg flex items-center justify-center w-full sm:w-auto"
          >
            <Filter size={20} className="mr-2" />
            {statusFilter}
            {isFilterMenuOpen ? <ChevronUp size={20} className="ml-2" /> : <ChevronDown size={20} className="ml-2" />}
          </button>
          {isFilterMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
            >
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                <button
                  onClick={() => {
                    setStatusFilter('All')
                    setIsFilterMenuOpen(false)
                  }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  role="menuitem"
                >
                  All Statuses
                </button>
                {statusSteps.map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status)
                      setIsFilterMenuOpen(false)
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    role="menuitem"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">Showing {paginatedOrders.length} of {filteredOrders.length} orders</p>
        <div className="flex items-center">
          <button
            onClick={() => requestSort('date')}
            className="mr-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            Date
            {sortConfig.key === 'date' && (
              sortConfig.direction === 'asc' ? <ChevronUp size={20} /> : <ChevronDown size={20} />
            )}
          </button>
          <button
            onClick={() => requestSort('totalAmount')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            Amount
            {sortConfig.key === 'totalAmount' && (
              sortConfig.direction === 'asc' ? <ChevronUp size={20} /> : <ChevronDown size={20} />
            )}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {paginatedOrders.map(order => (
          <OrderCard key={order._id} order={order} />
        ))}
      </AnimatePresence>
      {filteredOrders.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 mt-8"
        >
          No orders found.
        </motion.p>
      )}
      {pageCount > 1 && (
        <div className="flex justify-center mt-8">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
            <motion.button
              key={page}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentPage(page)}
              className={`mx-1 px-3 py-1 rounded ${
                currentPage === page
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {page}
            </motion.button>
          ))}
        </div>
      )}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetails
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

