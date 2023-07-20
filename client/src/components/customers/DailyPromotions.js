import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';
const DailyPromotions = () => {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [itemPromotions, setItemPromotions] = useState([]);
  const { customer } = useAuthContext();

  useEffect(() => {
    getAllItemPromotions();
    fetchItems();
  }, []);
  let navigate = useNavigate();

  const fetchItems = async () => {
    try {
      const response = await axios.get('/api/items');
      setItems(response.data);
    } catch (error) {
      console.log('Failed to fetch items', error);
    }
  };

  const getAllItemPromotions = async () => {
    try {
      const response = await axios.get('/api/promotions/viewpromos');
      setItemPromotions(response.data);
    } catch (error) {
      console.log('Failed to retrieve item promotions', error);
    }
  };
  const checkRewardPoints = (customerRewards, requiredPoints) => {
    return customerRewards >= requiredPoints;
  };
  const createOrder = async (customerId, itemPromotion) => {
    try {
      const itemIds = itemPromotion.items.map((item) => item._id);
      const quantityno = Array(itemPromotion.items.length).fill(1); // Create an array of length equal to the number of items and fill it with 1
  
      const orderData = {
        customerId: customerId,
        itemIds: itemIds,
        quantityno: quantityno,
      };
      await axios.post('/api/orders/createorder', orderData);
    } catch (error) {
      throw new Error('Failed to create the order.');
    }
  };
  const EarnReward = async (itemPromotion, customer, setOrders) => {
    try {
      // Check if the customer has enough reward points
      if (checkRewardPoints(customer.rewards, itemPromotion.discount)) {
        // Decrement the customer's reward points
        const updatedRewardPoints = customer.rewards - itemPromotion.discount;
  
        // Update the customer's reward points
        await axios.patch(`/api/customers/${customer.idc}`, { rewardPoints: updatedRewardPoints });
  
        // Create the order
        await createOrder(customer.idc, itemPromotion);
  
        alert('Rewards Earned! Check Your Orders');
        window.location.href = '/cview';
      } else {
        alert('Insufficient reward points. You do not have enough points to attain this promotion.');
      }
    } catch (error) {
      console.log('Failed to earn reward:', error);
      alert('Failed to earn reward. Please try again later.');
    }
  };
  return (
    <div>

      <h2>Daily Promotions</h2>
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
        <table className="table riped table-hover table-bordered container">
          <thead>
            <tr>
              <th>Promotion Name</th>
              <th>Needed Points</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Order Promotion</th>
            </tr>
          </thead>
          <tbody>
            {itemPromotions &&
              itemPromotions.map((itemPromotion) => {
                const items = itemPromotion.items.map((item) => item.name).join(' + ');
                return (
                  <tr key={itemPromotion._id}>
                    <td>{items}</td>
                    
                    <td>{itemPromotion.discount}</td>

                    <td>{itemPromotion.startDate}</td>
                    <td>{itemPromotion.endDate}</td>
                    <td>
                      <button className="btn btn-primary" onClick={() => EarnReward(itemPromotion)}>
                        Earn Reward
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailyPromotions;











