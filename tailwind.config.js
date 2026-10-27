export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        amarillo: '#FFD400',
        cafe: { DEFAULT: '#211402', claro: '#3D2A08', pre: '#1A1002' },
        rosa: { DEFAULT: '#FF88F7', claro: '#FFE8FC', fuerte: '#B5179E' },
        verde: { DEFAULT: '#45E586', texto: '#15803D' },
        azul: '#3EB1FF',
        morado: '#7D2DE2',
        crema: '#FFF6D6',
        fondo: '#EDEBE4',
        n0: '#FFFFFF',
        n5: '#F3F2F3',
        n10: '#E6E6E6',
        n40: '#B7BDBC',
        n60: '#6A676A',
        error: '#B91C1C',
      },
      fontFamily: { sn: ['"SN Pro"', 'system-ui', 'sans-serif'] },
      borderRadius: { pill: '500px' },
      boxShadow: {
        header: '0px 4px 16px 0px rgba(33,20,3,0.08)',
        card: '0px 4px 12px 0px rgba(33,20,3,0.08)',
      },
      backgroundImage: {
        'hero-brand': 'linear-gradient(150deg, #211402 14.6%, #3D2A08 85.4%)',
        'yellow-cta': 'linear-gradient(145deg, #FFD400 14.6%, #FFA800 85.4%)',
        success: 'linear-gradient(90deg, #45E586 14.6%, #00C853 85.4%)',
      },
      screens: { lg: '1024px' },
    },
  },
  plugins: [],
};
