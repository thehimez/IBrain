import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import DocumentsPage from './pages/DocumentsPage';

type Page = 'chat' | 'documents';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('chat');

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-navy-900">
      <Navbar onToggleSidebar={() => setSidebarOpen(o => !o)} />
      <div className="flex flex-1 min-h-0">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPage={currentPage}
          onNavigate={navigateTo}
        />
        <main className="flex-1 min-h-0 flex flex-col bg-navy-900 bg-grid">
          {currentPage === 'chat' && <ChatWindow />}
          {currentPage === 'documents' && (
            <DocumentsPage onOpenChat={() => navigateTo('chat')} />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  );
}
