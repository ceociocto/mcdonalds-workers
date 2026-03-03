/**
 * 订单摘要组件
 */

'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/config';

interface Card {
  id: number;
  cardId: string;
  phone: string;
  balance: number;
  dailyLimit: number;
  usedToday: number;
  status: string;
}

interface Store {
  id: number;
  storeId: string;
  name: string;
  address: string;
}

interface Combo {
  id: number;
  comboId: string;
  name: string;
  memberPrice: number;
  originalPrice: number;
  items: any;
}

interface OrderSummaryProps {
  store: Store | null;
  combo: Combo | null;
  onConfirm: () => void;
  loading?: boolean;
}

export default function OrderSummary({ store, combo, onConfirm, loading }: OrderSummaryProps) {
  const [matchedCard, setMatchedCard] = useState<Card | null>(null);
  const [estimating, setEstimating] = useState(false);

  useEffect(() => {
    if (store && combo) {
      estimateCard();
    }
  }, [store, combo]);

  const estimateCard = async () => {
    try {
      setEstimating(true);
      const response = await fetch(`${API_BASE_URL}/api/cards/available/${combo?.memberPrice}`);
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setMatchedCard(data.data[0]);
      }
    } catch (error) {
      console.error('获取会员卡失败:', error);
    } finally {
      setEstimating(false);
    }
  };

  const canSubmit = store && combo && matchedCard;

  const savings = combo ? combo.originalPrice - combo.memberPrice : 0;

  return (
    <div className="space-y-4">
      {/* 标题 */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg p-4">
        <h2 className="text-xl font-bold">📦 订单确认</h2>
      </div>

      {/* 餐厅信息 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold text-gray-900 mb-2">🏪 餐厅</h3>
        {store ? (
          <div>
            <p className="font-medium">{store.name}</p>
            <p className="text-sm text-gray-600 mt-1">{store.address}</p>
          </div>
        ) : (
          <p className="text-gray-400">请选择餐厅</p>
        )}
      </div>

      {/* 套餐信息 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold text-gray-900 mb-2">🍔 套餐</h3>
        {combo ? (
          <div className="space-y-2">
            <p className="font-medium">{combo.name}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-yellow-600">
                ¥{combo.memberPrice}
              </span>
              <span className="text-gray-400 line-through">
                ¥{combo.originalPrice}
              </span>
              {savings > 0 && (
                <span className="text-sm text-green-600 font-medium">
                  省 ¥{savings}
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-400">请选择套餐</p>
        )}
      </div>

      {/* 会员卡信息 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold text-gray-900 mb-2">💳 使用会员卡</h3>
        {estimating ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
            <span className="text-sm text-gray-600">智能匹配中...</span>
          </div>
        ) : matchedCard ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{matchedCard.cardId}</span>
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                可用
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <p>余额: ¥{matchedCard.balance}</p>
              <p>今日使用: {matchedCard.usedToday}/{matchedCard.dailyLimit}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-400">请先选择套餐</p>
        )}
      </div>

      {/* 预计信息 */}
      {combo && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">⏰ 预计时间</p>
              <p className="font-semibold text-gray-900">15 分钟</p>
            </div>
            <div>
              <p className="text-gray-600">🔢 取餐码</p>
              <p className="font-semibold text-gray-900">下单后生成</p>
            </div>
          </div>
        </div>
      )}

      {/* 提交按钮 */}
      <button
        onClick={onConfirm}
        disabled={!canSubmit || loading}
        className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
          canSubmit && !loading
            ? 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            创建订单中...
          </span>
        ) : (
          '确认下单'
        )}
      </button>

      {!canSubmit && (
        <p className="text-center text-sm text-gray-500">
          {!store ? '请选择餐厅' : !combo ? '请选择套餐' : '暂无可用会员卡'}
        </p>
      )}
    </div>
  );
}
