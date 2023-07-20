import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthContext } from '../../hooks/useAuthContext';

const CustomerViewOrders = () => {
  const [orders, setOrders] = useState([]);
  const { customer } = useAuthContext();
  useEffect(() => {


    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/orders/vieworder');
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to retrieve orders:', error);
      }
    };
    fetchOrders();
  }, []);
  const calculateTotalRewardPoints = (items) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };
  
  const updateCustomerRewardPoints = async (customerId, newRewardPoints) => {
    try {
      await axios.patch(`/api/customers/${customerId}`, {
        rewardPoints: newRewardPoints,
      });
    } catch (error) {
      throw new Error('Failed to update customer reward points.');
    }
  };
  
  const handleDeleteOrder = async (orderId) => {
    try {
      await axios.delete(`/api/orders/delete/${orderId}`);
    } catch (error) {
      throw new Error('Failed to delete the order.');
    }
  };

  const handleReceivedOrder = async (orderId, setOrders) => {
    try {
      // Get the order details
      const order = orders.find((order) => order._id === orderId);
  
      if (!order) {
        throw new Error('Order not found.');
      }
  
      // Calculate the total reward points to increase
      const totalRewardPoints = calculateTotalRewardPoints(order.items);
  
      // Get the current reward points of the customer
      const response = await axios.get(`/api/customers/${order.customer._id}`);
      const currentRewardPoints = response.data.rewardPoints;
  
      // Calculate the new reward points by adding the totalRewardPoints to the current reward points
      const newRewardPoints = currentRewardPoints + totalRewardPoints;
  
      // Increase the reward points by the item.quantity for each item
      await updateCustomerRewardPoints(order.customer._id, newRewardPoints);
  
      // Display an alert to the user
      alert(`Reward points have been incremented by ${totalRewardPoints}`);
  
      // Delete the order
      await handleDeleteOrder(orderId);
  
      // Refresh the orders list after deletion
      const ordersData = await fetchOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to handle received order:', error.message);
      alert('Failed to handle received order. Please try again later.');
    }
  };

  let navigate = useNavigate();

  return (
    <div className="table-responsive">
      <>
        <button className="btn btn-secondary float-right" onClick={() => navigate(-1)}>
          Back
        </button>
      </>

      <>
        <button className="btn btn-primary float-right" onClick={() => navigate('/customerhome')}>
          Home
        </button>
      </>

      <table className="table riped  table-hover table-bordered container">
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>Customer Reward Points</th>
            <th>Order Date</th>
            <th>Items</th>
            <th>Receive Order</th> {/* Added column for delete button */}
            <th>Cancel Order</th> {/* Added column for delete button */}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order.customer.name}</td>
              <td>{order.customer.rewardPoints}</td>
              <td>{order.orderDate}</td>
              <td>
                <table className="table riped  table-hover table-bordered container">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Item Price</th>
                      <th>Requested Quantity</th>
                      <th>Total Price </th>

                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item._id}>
                        <td>{item.item ? item.item.name : 'null'}</td>
                        <td>{item.item ? item.item.price : 'null'}</td>
                        <td>{item.quantity}</td>
                        <td>{item.quantity * item.item.price}</td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
              <td>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteOrder(order._id)}
                >
                  Cancel
                </button>
              </td>
              <td>
                <button
                  className="btn btn-primary"
                  onClick={() => handleReceivedOrder(order._id)}
                >
                 Order Recieved
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerViewOrders;

