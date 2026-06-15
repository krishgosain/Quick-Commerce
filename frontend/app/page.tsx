'use client';

import { useState } from 'react';

export default function Home() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8080/api/search?query=${query}&lat=18.5204&lng=73.8567`);
            const data = await res.json();
            setResults(data);
        } catch (error) {
            console.error('Search failed', error);
        }
        setLoading(false);
    };

    const handleCheckout = async (platform, productId) => {
        try {
            const res = await fetch('http://localhost:8080/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ platform, productId })
            });
            const data = await res.json();
            window.location.href = data.url;
        } catch (error) {
            console.error('Checkout routing failed', error);
        }
    };

    return (
        <main className="max-w-md mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Unified Q-Comm Cart</h1>
            <form onSubmit={handleSearch} className="mb-6 flex gap-2">
                <input 
                    type="text" 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                    placeholder="Search groceries..." 
                    className="flex-1 p-2 border rounded"
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                    {loading ? '...' : 'Search'}
                </button>
            </form>

            <div className="flex flex-col gap-4">
                {results.map((item, idx) => (
                    <div key={idx} className="border p-4 rounded shadow-sm flex justify-between items-center">
                        <div>
                            <h3 className="font-bold capitalize">{item.platform}</h3>
                            <p>₹{item.price} + ₹{item.deliveryFee} delivery</p>
                            <p className="text-sm text-gray-500">ETA: {item.eta}</p>
                        </div>
                        <button 
                            onClick={() => handleCheckout(item.platform, item.productId)}
                            className="bg-green-600 text-white px-4 py-2 rounded"
                        >
                            Buy (₹{item.price + item.deliveryFee})
                        </button>
                    </div>
                ))}
            </div>
        </main>
    );
}
