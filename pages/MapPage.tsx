import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { AssetStatus } from '../types';
import { useApp } from '../hooks/useApp';

const getStatusColor = (status: AssetStatus) => {
    switch (status) {
        case AssetStatus.ACTIVE: return 'text-green-600';
        case AssetStatus.IN_REPAIR: return 'text-orange-600';
        case AssetStatus.DECOMMISSIONED: return 'text-slate-600';
        case AssetStatus.IDLE: return 'text-blue-600';
        default: return 'text-gray-600';
    }
}

const MapPage: React.FC = () => {
    const { assets } = useApp();
    
    const assetsWithCoords = useMemo(() => assets.filter(asset => 
        asset.coordinates && 
        typeof asset.coordinates.lat === 'number' && 
        typeof asset.coordinates.lng === 'number'
    ), [assets]);
    
    const mapCenter: [number, number] = useMemo(() => {
        if (assetsWithCoords.length > 0) {
            const lats = assetsWithCoords.map(a => a.coordinates!.lat);
            const lngs = assetsWithCoords.map(a => a.coordinates!.lng);
            const avgLat = lats.reduce((sum, lat) => sum + lat, 0) / lats.length;
            const avgLng = lngs.reduce((sum, lng) => sum + lng, 0) / lngs.length;
            return [avgLat, avgLng];
        }
        return [-23.55052, -46.633308]; // Default to São Paulo if no assets have coords
    }, [assetsWithCoords]);


    return (
        <div className="p-4 md:p-8 space-y-6 h-full">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg h-[calc(100vh-150px)] p-4">
                {assetsWithCoords.length > 0 ? (
                    <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {assetsWithCoords.map(asset => (
                             <Marker key={asset.id} position={[asset.coordinates!.lat, asset.coordinates!.lng]}>
                                <Popup>
                                    <div className="p-1">
                                        <h3 className="font-bold text-md mb-1 text-gray-800">{asset.name}</h3>
                                        <p className="text-sm text-gray-600"><strong>Tipo:</strong> {asset.type}</p>
                                        <p className="text-sm text-gray-600"><strong>Local:</strong> {asset.location}</p>
                                        <p className="text-sm text-gray-600">
                                            <strong>Status:</strong> 
                                            <span className={`font-semibold ml-1 ${getStatusColor(asset.status)}`}>{asset.status}</span>
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-center">
                        <div>
                           <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Nenhum ativo para exibir no mapa.</h3>
                           <p className="text-gray-500 dark:text-gray-400 mt-2">Adicione coordenadas de latitude e longitude aos seus ativos para vê-los aqui.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapPage;
