import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get('pincode');

    if (!pincode) {
        return NextResponse.json({ error: 'Pincode is required' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 seconds timeout

    try {
        // Calling Delhivery Pincode Serviceability API (Production)
        const response = await fetch(`https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=${pincode}`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${process.env.DELHIVERY_API_TOKEN}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
            },
            signal: controller.signal,
            cache: 'no-store'
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error(`❌ [DELHIVERY API] HTTP Error: ${response.status} ${response.statusText}`);
            return NextResponse.json({ 
                serviceable: false,
                message: "Service temporarily unavailable" 
            }, { status: response.status });
        }

        const data = await response.json();
        
        // Delhivery returns an array in 'delivery_codes'
        const info = data.delivery_codes?.[0]?.postal_code;

        if (!info) {
            return NextResponse.json({ 
                serviceable: false,
                message: "Location not serviceable" 
            });
        }

        // Mapping Delhivery response to our frontend needs
        return NextResponse.json({
            serviceable: true,
            cod: info.cod === "Y",
            prepaid: info.pre_paid === "Y",
            district: info.district,
            state: info.state_code,
            city: info.city
        });

    } catch (error: any) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            console.error("❌ [DELHIVERY API] Request timed out after 20s");
            return NextResponse.json({ 
                error: 'Connection timeout',
                serviceable: false 
            }, { status: 504 });
        }

        console.error("❌ [DELHIVERY API] Error:", error);
        return NextResponse.json({ 
            error: 'Failed to check serviceability',
            serviceable: false,
            details: error.message 
        }, { status: 500 });
    }
}
