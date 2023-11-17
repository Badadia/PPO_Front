import React, { useState, useEffect } from 'react';
import styles from './styles/realizar-denuncia.module.css';
import { motion } from 'framer-motion';
import Link from 'next/link';
import 'ol/ol.css';
import { Map, View, Overlay } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Point } from 'ol/geom';
import { Icon, Style } from 'ol/style';
import Feature from 'ol/Feature';

const RealizarDenuncia = () => {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [detalhesVisiveis, setDetalhesVisiveis] = useState(false);
  const [infoRua, setInfoRua] = useState('');
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (detalhesVisiveis) {
      const initialMap = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new OSM()
          })
        ],
        view: new View({
          center: fromLonLat([-36.4966, -8.8829]),
          zoom: 13,
          maxZoom: 17,
          minZoom: 11
        })
      });

      // Adiciona interação de clique no mapa
      initialMap.on('singleclick', handleMapClick);

      setMap(initialMap);
    }
  }, [detalhesVisiveis]);

  const handleCategoriaClick = (categoria) => {
    setCategoriaSelecionada(categoria);
    setDetalhesVisiveis(true);
  };

  const getStreetInfo = async (coordinate) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinate[1]}&lon=${coordinate[0]}`);
      const data = await response.json();
      setInfoRua(data.display_name);
    } catch (error) {
      console.error('Erro ao buscar informações da rua:', error);
    }
  };

  const handleMapClick = (event) => {
    if (!map) return; 
  
    const clickedCoordinate = toLonLat(event.coordinate);
    getStreetInfo(clickedCoordinate);
  
    // Adiciona marcação no mapa
    const marker = new Feature({
      geometry: new Point(event.coordinate)
    });
  
    marker.setStyle(new Style({
      image: new Icon({
        src: '/marcador.png',
        scale: 0.1
      })
    }));
  
    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [marker]
      })
    });
  
    map.addLayer(vectorLayer);
  };

  return (
    <div className={styles.container}>
      <motion.div className={styles.logo} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Link href="/">
          <h1 className={styles.logo}>
            <span className={styles.gus}>Gus</span>
            <span className={styles.alert}>Alert</span>
          </h1>
        </Link>
      </motion.div>
      <div className={styles.introText}>
        Selecione a categoria da denúncia para continuar:
      </div>
      <div className={styles.categorias}>
        {['Poste sem luz', 'Esgoto exposto', 'Buraco na rua', 'Coletar entulho'].map((categoria) => (
          <motion.button
            key={categoria}
            className={`${styles.categoria} ${categoriaSelecionada === categoria ? styles.categoriaSelecionada : ''}`}
            onClick={() => handleCategoriaClick(categoria)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {categoria}
          </motion.button>
        ))}
      </div>
      {detalhesVisiveis && (
        <motion.div className={styles.detalhesDenuncia} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <input className={styles.input} type="text" placeholder="Endereço do problema" value={infoRua} />
          <textarea className={styles.textarea} placeholder="Descreva o problema"></textarea>
          <input className={styles.inputFile} type="file" accept="image/*" />
          <div id="map" className={styles.mapPlaceholder}>Localização no mapa</div>

          <motion.button className={styles.submitButton} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            Enviar denúncia
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default RealizarDenuncia;
