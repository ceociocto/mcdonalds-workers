'use client';

import { useState } from 'react';
import { API_BASE_URL } from '@/lib/config';
import StoreSelector from '@/components/StoreSelector';
import ComboSelector from '@/components/ComboSelector';
import OrderSummary from '@/components/OrderSummary';
import OrderSuccess from '@/components/OrderSuccess';

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
  discount: string;
  category: string;
}

type Step = 'store' | 'combo' | 'summary' | 'success';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>('store');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetOrder = () => {
    setSelectedStore(null);
    setSelectedCombo(null);
    setOrderId(null);
    setCurrentStep('store');
  };

  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store);
    setCurrentStep('combo');
  };

  const handleComboSelect = (combo: Combo) => {
    setSelectedCombo(combo);
    setCurrentStep('summary');
  };

  const handleConfirmOrder = async () => {
    if (!selectedStore || !selectedCombo) return;

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: `user_${Date.now()}`,
          storeId: selectedStore.storeId,
          comboId: selectedCombo.comboId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOrderId(data.data.orderId);
        setCurrentStep('success');
      } else {
        alert('订单创建失败: ' + data.message);
      }
    } catch (error) {
      console.error('创建订单失败:', error);
      alert('订单创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🍔 麦当劳代下单</h1>
              <p className="text-sm text-gray-600 mt-1">自动匹配最优会员卡</p>
            </div>

            {/* 步骤指示器 */}
            {currentStep !== 'success' && (
              <div className="flex items-center gap-2">
                <StepIndicator number={1} label="选餐厅" active={currentStep === 'store'} completed={!!selectedStore} />
                <div className="w-8 h-0.5 bg-gray-200"></div>
                <StepIndicator number={2} label="选套餐" active={currentStep === 'combo'} completed={!!selectedCombo} />
                <div className="w-8 h-0.5 bg-gray-200"></div>
                <StepIndicator number={3} label="确认" active={currentStep === 'summary'} completed={false} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 内容区域 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {currentStep === 'store' && (
          <div className="max-w-2xl mx-auto">
            <StoreSelector onStoreSelect={handleStoreSelect} />
          </div>
        )}

        {currentStep === 'combo' && (
          <div className="max-w-4xl">
            <button
              onClick={() => setCurrentStep('store')}
              className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              ← 返回选择餐厅
            </button>
            <ComboSelector
              budget={30}
              onComboSelect={handleComboSelect}
              selectedCombo={selectedCombo}
            />
          </div>
        )}

        {currentStep === 'summary' && (
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => setCurrentStep('combo')}
              className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              ← 返回选择套餐
            </button>
            <OrderSummary
              store={selectedStore}
              combo={selectedCombo}
              onConfirm={handleConfirmOrder}
              loading={loading}
            />
          </div>
        )}

        {currentStep === 'success' && orderId && (
          <OrderSuccess orderId={orderId} onNewOrder={resetOrder} />
        )}
      </div>
    </main>
  );
}

function StepIndicator({ number, label, active, completed }: {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
        ${completed ? 'bg-green-500 text-white' : ''}
        ${active && !completed ? 'bg-yellow-500 text-white' : ''}
        ${!active && !completed ? 'bg-gray-200 text-gray-600' : ''}
      `}>
        {completed ? '✓' : number}
      </div>
      <span className={`text-sm font-medium ${active ? 'text-yellow-600' : 'text-gray-600'}`}>
        {label}
      </span>
    </div>
  );
}
