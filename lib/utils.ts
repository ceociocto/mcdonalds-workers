/**
 * 工具函数
 */

/**
 * 生成订单号
 */
export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MC${timestamp}${random}`;
}

/**
 * 生成取餐码
 */
export function generatePickupCode(storeId: string): string {
  const data = `${storeId}${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).substring(0, 4).toUpperCase();
}

/**
 * 计算两点间距离（米）
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // 地球半径（米）
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * 格式化货币
 */
export function formatCurrency(amount: number): string {
  return `¥${amount.toFixed(2)}`;
}

/**
 * 成功响应
 */
export function successResponse<T>(data: T, message = 'Success') {
  return Response.json({
    success: true,
    message,
    data,
  });
}

/**
 * 错误响应
 */
export function errorResponse(message: string, status = 400) {
  return Response.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

/**
 * CORS处理
 */
export function handleCors(request: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // 处理OPTIONS预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  return corsHeaders;
}
