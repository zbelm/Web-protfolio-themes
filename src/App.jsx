import { useApp } from './core/AppState.jsx';
import Nav from './shared/Nav.jsx';
import Footer from './shared/Footer.jsx';
import { FirstVisit, SwitchLayers } from './shared/Loaders.jsx';

export default function App() {
  const { theme } = useApp();

  return (
    <>
      <div id="top" />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {theme && (
        <div className={`app app--${theme.id}`} key={theme.id}>
          {theme.Background && <theme.Background />}
          {theme.Effects && <theme.Effects />}
          <Nav />
          <main id="main" tabIndex={-1}>
            {theme.order.map((id) => {
              const Section = theme.sections[id];
              return Section ? <Section key={id} /> : null;
            })}
          </main>
          <Footer />
        </div>
      )}
      <SwitchLayers />
      <FirstVisit />
    </>
  );
}
