/**
 * 订单成功页面
 */

'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/config';

interface Order {
  orderId: string;
  pickupCode: string;
  storeName: string;
  comboName: string;
  amount: number;
  cardId: string;
  estimatedTime: number;
  createdAt: string;
}

interface OrderSuccessProps {
  orderId: string;
  onNewOrder: () => void;
}

export default function OrderSuccess({ orderId, onNewOrder }: OrderSuccessProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();
      if (data.success) {
        setOrder(data.data);
      }
    } catch (error) {
      console.error('获取订单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载订单信息...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">订单信息加载失败</p>
        <button
          onClick={onNewOrder}
          className="mt-4 px-6 py-2 bg-yellow-500 text-white rounded-lg"
        >
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* 成功动画 */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">下单成功！</h1>
        <p className="text-gray-600 mt-2">您的订单已创建</p>
      </div>

      {/* 取餐码卡片 */}
      <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white rounded-2xl p-6 shadow-lg">
        <div className="text-center">
          <p className="text-lg opacity-90 mb-2">取餐码</p>
          <p className="text-6xl font-bold tracking-wider">{order.pickupCode}</p>
        </div>
      </div>

      {/* 订单详情 */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">订单详情</h2>

        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">订单号</span>
            <span className="font-mono font-semibold">{order.orderId}</span>
          </div>

          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">餐厅</span>
            <span className="font-semibold">{order.storeName}</span>
          </div>

          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">套餐</span>
            <span className="font-semibold">{order.comboName}</span>
          </div>

          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">金额</span>
            <span className="font-semibold text-yellow-600">¥{order.amount}</span>
          </div>

          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">使用会员卡</span>
            <span className="font-semibold">{order.cardId}</span>
          </div>

          <div className="flex justify-between py-2">
            <span className="text-gray-600">预计时间</span>
            <span className="font-semibold text-green-600">约 {order.estimatedTime} 分钟</span>
          </div>
        </div>
      </div>

      {/* 提示信息 */}
      <div className="bg-blue-50 rounded-lg p-4 space-y-2">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📱</span>
          <div>
            <p className="font-semibold text-blue-900">温馨提示</p>
            <ul className="text-sm text-blue-800 mt-1 space-y-1">
              <li>• 请保存取餐码，到店出示即可取餐</li>
              <li>• 建议提前到达，避免等待</li>
              <li>• 如有问题请联系客服</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="space-y-3">
        <button
          onClick={() => {
            navigator.clipboard.writeText(order.pickupCode);
            alert('取餐码已复制到剪贴板');
          }}
          className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          📋 复制取餐码
        </button>

        <button
          onClick={onNewOrder}
          className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        >
          再来一单
        </button>
      </div>
    </div>
  );
}
