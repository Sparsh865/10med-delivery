/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Edit, Trash, Eye, Check, X, Package, Truck, Home, BarChart2, PieChart, LineChart, ShoppingBag, Pill, Upload } from 'lucide-react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js'
import { Bar, Pie, Line } from 'react-chartjs-2'
import axios from 'axios'
import { toast } from 'react-hot-toast'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement)

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [medicines, setMedicines] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [orderSearchTerm, setOrderSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('')
  const [newMedicine, setNewMedicine] = useState({
    name: '', company: '', salt: '', manufacturing: '', expiry: '', price: '', stock: '', image: ''
  })
  const [editingMedicineId, setEditingMedicineId] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchOrders()
    fetchMedicines()
  }, [])

  

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:3000/api/orders', {
        headers: { Authorization: token }
      })
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to fetch orders')
    }
  }

  const fetchMedicines = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/medicines')
      setMedicines(response.data)
    } catch (error) {
      console.error('Error fetching medicines:', error)
      toast.error('Failed to fetch medicines')
    }
  }

  const handleOrderAction = async (id, action) => {
    try {
      const token = localStorage.getItem('token')
      if (action === 'delete') {
        await axios.delete(`http://localhost:3000/api/orders/${id}`, {
          headers: { Authorization: token }
        })
        toast.success('Order deleted successfully')
        fetchOrders()
      } else if (action === 'accept' || action === 'reject') {
        await axios.put(`http://localhost:3000/api/orders/${id}`, {
          status: action === 'accept' ? 'Accepted' : 'Rejected'
        }, {
          headers: { Authorization: token }
        })
        toast.success(`Order ${action === 'accept' ? 'accepted' : 'rejected'}`)
        fetchOrders()
      } else if (action === 'view') {
        const orderToView = orders.find(order => order._id === id)
        setSelectedOrder(orderToView)
      }
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order')
    }
  }

  const handleOrderStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`http://localhost:3000/api/orders/${id}`, {
        status: newStatus
      }, {
        headers: { Authorization: token }
      })
      fetchOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    }
  }

  const handleMedicineAction = async (id, action) => {
    try {
      const token = localStorage.getItem('token')
      if (action === 'delete') {
        const confirmDelete = window.confirm('Are you sure you want to delete this medicine?')
        if (confirmDelete) {
          await axios.delete(`http://localhost:3000/api/medicines/${id}`, {
            headers: { Authorization: token }
          })
          toast.success('Medicine deleted successfully')
          fetchMedicines()
        }
      } else if (action === 'edit') {
        const medicineToEdit = medicines.find(medicine => medicine._id === id)
        setNewMedicine({ ...medicineToEdit })
        setEditingMedicineId(id)
      }
    } catch (error) {
      console.error('Error updating medicine:', error)
      toast.error('Failed to update medicine')
    }
  }

  const handleMedicineSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const medicineData = {
        ...newMedicine,
        price: parseFloat(newMedicine.price),
        stock: parseInt(newMedicine.stock, 10)
      }
      
      let response;
      if (editingMedicineId === 'new') {
        response = await axios.post('http://localhost:3000/api/medicines', medicineData, {
          headers: { Authorization: token }
        })
        if (response.status === 201) {
          toast.success('Medicine added successfully')
        } else {
          throw new Error('Failed to add medicine')
        }
      } else if (editingMedicineId) {
        response = await axios.put(`http://localhost:3000/api/medicines/${editingMedicineId}`, medicineData, {
          headers: { Authorization: token }
        })
        if (response.status === 200) {
          toast.success('Medicine updated successfully')
        } else {
          throw new Error('Failed to update medicine')
        }
      }
      
      setNewMedicine({
        name: '', company: '', salt: '', manufacturing: '', expiry: '', price: '', stock: '', image: ''
      })
      setEditingMedicineId(null)
      fetchMedicines()
    } catch (error) {
      console.error('Error submitting medicine:', error)
      if (error.response) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
        console.error('Response headers:', error.response.headers)
      }
      toast.error(`Failed to submit medicine: ${error.message}`)
    }
  }

  

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewMedicine({ ...newMedicine, image: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const filteredMedicines = medicines.filter(med => 
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.salt.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredOrders = orders.filter(order => 
    (order.user && order.user.name && order.user.name.toLowerCase().includes(orderSearchTerm.toLowerCase())) ||
    (order.user && order.user.email && order.user.email.toLowerCase().includes(orderSearchTerm.toLowerCase()))
  ).filter(order =>
    (statusFilter === 'All' || order.status === statusFilter) &&
    (dateFilter === '' || new Date(order.date).toLocaleDateString() === new Date(dateFilter).toLocaleDateString())
  ).sort((a, b) => {
    if (statusFilter === 'All') {
      return 0; 
    }
    if (a.status === statusFilter && b.status !== statusFilter) {
      return -1; 
    }
    if (a.status !== statusFilter && b.status === statusFilter) {
      return 1; 
    }
    return 0;   })
  const orderStatusData = {
    labels: ['Pending', 'Accepted', 'Packing', 'Shipped', 'Out for Delivery', 'Delivered', 'Rejected'],
    datasets: [{
      data: [
        orders.filter(o => o.status === 'Pending').length,
        orders.filter(o => o.status === 'Accepted').length,
        orders.filter(o => o.status === 'Packing').length,
        orders.filter(o => o.status === 'Shipped').length,
        orders.filter(o => o.status === 'Out for Delivery').length,
        orders.filter(o => o.status === 'Delivered').length,
        orders.filter(o => o.status === 'Rejected').length,
      ],
      backgroundColor: ['#FFA500', '#4CAF50', '#2196F3', '#9C27B0', '#FFFFC3', '#00BCD4', '#F44336'],
    }]
  }

  const calculateMonthlySales = () => {
    const monthlySales = Array(12).fill(0)
    orders.forEach(order => {
      const orderDate = new Date(order.date)
      const monthIndex = orderDate.getMonth()
      monthlySales[monthIndex] += order.totalAmount
    })
    return monthlySales
  }

  const monthlySalesData = calculateMonthlySales()

  const totalSalesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Total Sales',
      data: monthlySalesData,
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }]
  }

  const stockLevelsData = {
    labels: medicines.map(m => m.name),
    datasets: [{
      label: 'Stock Levels',
      data: medicines.map(m => m.stock),
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
    }]
  }

  return (
    <div className="flex h-screen bg-gray-100">
      
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-2xl font-semibold text-green-600">10Med Dashboard</h2>
        </div>
        <nav className="mt-4">
          <a 
            href="#orders" 
            className={`flex items-center px-4 py-2 text-gray-700 ${activeTab === 'orders' ? 'bg-green-100' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag className="mr-2" />
            Orders
          </a>
          <a 
            href="#medicines" 
            className={`flex items-center px-4 py-2 text-gray-700 ${activeTab === 'medicines' ? 'bg-green-100' : ''}`}
            onClick={() => setActiveTab('medicines')}
          >
            <Pill className="mr-2" />
            Medicines
          </a>
        </nav>
      </div>

      
      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Order Management</h2>
            <div className="mb-4 flex items-center space-x-4">
              <div className="flex-1">
                <input 
                  type="text" 
                  placeholder="Search orders..." 
                  className="border rounded px-2 py-1 w-full"
                  value={orderSearchTerm}
                  onChange={(e) => setOrderSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="border rounded px-2 py-1"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Packing">Packing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Rejected">Rejected</option>
              </select>
              <input 
                type="date" 
                className="border rounded px-2 py-1"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2">Order ID</th>
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Items</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order._id} className="border-t">
                    <td className="px-4 py-2">{order._id}</td>
                    <td className="px-4 py-2">{order.user ? order.user.name : 'N/A'}</td>
                    <td className="px-4 py-2">
                      {order.items && order.items.map(item => 
                        item && item.medicine ? `${item.medicine.name} (${item.quantity})` : 'N/A'
                      ).join(', ')}
                    </td>
                    <td className="px-4 py-2">₹{order.totalAmount}</td>
                    <td className="px-4 py-2">
                      <select 
                        value={order.status} 
                        onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Packing">Packing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">{new Date(order.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      <button onClick={() => handleOrderAction(order._id, 'view')} className="mr-2 text-blue-500"><Eye size={20} /></button>
                      <button onClick={() => handleOrderAction(order._id, 'delete')} className="text-red-500"><Trash size={20} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {selectedOrder && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" onClick={() => setSelectedOrder(null)}>
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={e => e.stopPropagation()}>
                  <div className="mt-3 text-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Order Details</h3>
                    <div className="mt-2 px-7 py-3">
                      <p className="text-sm text-gray-500">
                        Order ID: {selectedOrder._id}
                      </p>
                      <p className="text-sm text-gray-500">
                        User: {selectedOrder.user ? selectedOrder.user.name : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Email: {selectedOrder.user ? selectedOrder.user.email : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Items: {selectedOrder.items && selectedOrder.items.map(item => 
                          item && item.medicine ? `${item.medicine.name} (${item.quantity})` : 'N/A'
                        ).join(', ')}
                      </p>
                      <p className="text-sm text-gray-500">
                        Total: ₹{selectedOrder.totalAmount}
                      </p>
                      <p className="text-sm text-gray-500">
                        Status: {selectedOrder.status}
                      </p>
                      <p className="text-sm text-gray-500">
                        Date: {new Date(selectedOrder.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Address: {selectedOrder.address ? `${selectedOrder.address.street}, ${selectedOrder.address.city}, ${selectedOrder.address.state}, ${selectedOrder.address.pincode}` : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Nearby Location: {selectedOrder.address ? selectedOrder.address.nearbyLocation : 'N/A'}
                      </p>
                    </div>
                    <div className="items-center px-4 py-3">
                      <button
                        id="ok-btn"
                        className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
                        onClick={() => setSelectedOrder(null)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Order Status Distribution</h3>
                <Pie data={orderStatusData} />
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
                <Bar data={totalSalesData} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'medicines' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Medicine Management</h2>
            <div className="mb-4 flex items-center">
              <input 
                type="text" 
                placeholder="Search medicines..." 
                className="border rounded px-2 py-1 mr-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                onClick={() => setEditingMedicineId('new')} 
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                <Plus size={20} className="inline mr-1" /> Add Medicine
              </button>
            </div>

            {(editingMedicineId === 'new' || editingMedicineId !== null) && (
              <form onSubmit={handleMedicineSubmit} className="mb-4 bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">{editingMedicineId === 'new' ? 'Add New Medicine' : 'Edit Medicine'}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Name" 
                    className="border rounded px-2 py-1"
                    value={newMedicine.name}
                    onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Company" 
                    className="border rounded px-2 py-1"
                    value={newMedicine.company}
                    onChange={(e) => setNewMedicine({...newMedicine, company: e.target.value})}
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Salt" 
                    className="border rounded px-2 py-1"
                    value={newMedicine.salt}
                    onChange={(e) => setNewMedicine({...newMedicine, salt: e.target.value})}
                    required
                  />
                  <input 
                    type="date" 
                    placeholder="Manufacturing Date" 
                    className="border rounded px-2 py-1"
                    value={newMedicine.manufacturing}
                    onChange={(e) => setNewMedicine({...newMedicine, manufacturing: e.target.value})}
                    required
                  />
                  <input 
                    type="date" 
                    placeholder="Expiry Date" 
                    className="border rounded px-2 py-1"
                    value={newMedicine.expiry}
                    onChange={(e) => setNewMedicine({...newMedicine, expiry: e.target.value})}
                    required
                  />
                  <input 
                    type="number" 
                    placeholder="Price" 
                    className="border rounded px-2 py-1"
                    value={newMedicine.price}
                    onChange={(e) => setNewMedicine({...newMedicine, price: e.target.value})}
                    required
                  />
                  <input 
                    type="number" 
                    placeholder="Stock" 
                    className="border rounded px-2 py-1"
                    value={newMedicine.stock}
                    onChange={(e) => setNewMedicine({...newMedicine, stock: e.target.value})}
                    required
                  />
                  <div className="flex items-center">
                    <input 
                      type="text" 
                      placeholder="Image URL" 
                      className="border rounded px-2 py-1 flex-grow mr-2"
                      value={newMedicine.image}
                      onChange={(e) => setNewMedicine({...newMedicine, image: e.target.value})}
                      required
                    />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                      ref={fileInputRef}
                    />
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current.click()}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      <Upload size={20} />
                    </button>
                  </div>
                </div>
                <button type="submit" className="mt-4 bg-green-500 text-white px-4 py-2 rounded">
                  {editingMedicineId === 'new' ? 'Add Medicine' : 'Update Medicine'}
                </button>
              </form>
            )}

            <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Company</th>
                  <th className="px-4 py-2">Salt</th>
                  <th className="px-4 py-2">Manufacturing</th>
                  <th className="px-4 py-2">Expiry</th>
                  <th className="px-4 py-2">Price</th>
                  <th className="px-4 py-2">Stock</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map(medicine => (
                  <tr key={medicine._id} className="border-t">
                    <td className="px-4 py-2">{medicine.name}</td>
                    <td className="px-4 py-2">{medicine.company}</td>
                    <td className="px-4 py-2">{medicine.salt}</td>
                    <td className="px-4 py-2">{new Date(medicine.manufacturing).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{new Date(medicine.expiry).toLocaleDateString()}</td>
                    <td className="px-4 py-2">₹{medicine.price}</td>
                    <td className="px-4 py-2">{medicine.stock}</td>
                    <td className="px-4 py-2">
                      <button onClick={() => handleMedicineAction(medicine._id, 'edit')} className="mr-2 text-blue-500"><Edit size={20} /></button>
                      <button onClick={() => handleMedicineAction(medicine._id, 'delete')} className="text-red-500"><Trash size={20} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Stock Levels</h3>
                <Bar data={stockLevelsData} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

