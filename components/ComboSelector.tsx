/**
 * 套餐选择组件
 */

'use client';

import { useState, useEffect } from 'react';

interface Combo {
  id: number;
  comboId: string;
  name: string;
  originalPrice: number;
  memberPrice: number;
  items: any;
  discount: string;
  category: string;
}

interface ComboSelectorProps {
  budget?: number;
  onComboSelect: (combo: Combo) => void;
  selectedCombo?: Combo | null;
}

export default function ComboSelector({ budget = 30, onComboSelect, selectedCombo }: ComboSelectorProps) {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'breakfast' | 'lunch'>('all');

  useEffect(() => {
    fetchCombos();
  }, [budget, filter]);

  const fetchCombos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/combos/budget/${budget}`);
      const data = await response.json();
      if (data.success) {
        let filtered = data.data;
        if (filter !== 'all') {
          filtered = filtered.filter((c: Combo) => c.category === filter);
        }
        setCombos(filtered);
      }
    } catch (error) {
      console.error('获取套餐失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatItems = (items: any) => {
    if (typeof items === 'string') {
      items = JSON.parse(items);
    }
    return Object.values(items).join(' + ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 预算和筛选 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">💰 预算: ¥{budget}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'all'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter('breakfast')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'breakfast'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              早餐
            </button>
            <button
              onClick={() => setFilter('lunch')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'lunch'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              午餐/晚餐
            </button>
          </div>
        </div>
      </div>

      {/* 套餐列表 */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">
          🍔 找到 {combos.length} 个套餐
        </h3>

        {combos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>此预算下没有可用套餐</p>
            <p className="text-sm mt-2">增加预算或更改筛选条件</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {combos.map((combo) => {
              const isSelected = selectedCombo?.id === combo.id;
              const itemsObj = typeof combo.items === 'string' ? JSON.parse(combo.items) : combo.items;

              return (
                <button
                  key={combo.id}
                  onClick={() => onComboSelect(combo)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-yellow-500 bg-yellow-50 shadow-lg'
                      : 'border-gray-200 hover:border-yellow-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900 flex-1">{combo.name}</h4>
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      省{combo.discount}%
                    </span>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-yellow-600">
                        ¥{combo.memberPrice}
                      </span>
                      <span className="text-gray-400 line-through">
                        ¥{combo.originalPrice}
                      </span>
                    </div>

                    <p className="text-gray-600">
                      🍔 {formatItems(combo.items)}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-yellow-200">
                      <span className="text-sm text-green-600 font-medium">
                        ✓ 已选择
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
