import React from 'react';
import ExpandedCapabilityView from './ExpandedCapabilityView';
import CapabilityMaturityAssessment from './CapabilityMaturityAssessment';

function CapabilityPopupModal({
  popupInfo,
  isExpanded,
  showAssessment,
  setPopupInfo,
  setIsExpanded,
  setShowAssessment,
  userFlow,
  entryId // <-- add entryId to props
}) {
  if (!popupInfo.show) return null;
  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.18)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto', // Allow modal to expand to full viewport width
      }}
    >
      <div
        style={{
          background: '#fff',
          color: '#222',
          border: '1px solid #b6c2d6',
          borderRadius: 10,
          boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
          padding: '24px 32px 18px 24px',
          fontSize: '1.1em',
          minWidth: popupInfo.popupStep === 'description' ? 350 : (popupInfo.popupStep === 'expanded' ? 1200 : 700),
          maxWidth: popupInfo.popupStep === 'description' ? 350 : (popupInfo.popupStep === 'expanded' ? 1200 : 700),
          width: popupInfo.popupStep === 'description' ? 350 : (popupInfo.popupStep === 'expanded' ? 1200 : 700),
          minHeight: isExpanded ? '80vh' : undefined,
          maxHeight: '90vh', // Prevent modal from exceeding viewport height
          position: 'relative',
          transition: 'all 0.2s',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          overflowY: 'auto', // Enable vertical scroll if needed
          overflowX: 'hidden',
        }}
      >
        {isExpanded ? (
          showAssessment ? (
            <CapabilityMaturityAssessment
              valueChainName={popupInfo.frameName}
              capabilityName={popupInfo.capName}
              valueChainId={popupInfo.valueChainId}
              valueChainEntryId={popupInfo.valueChainEntryId}
              valueChainEntryName={popupInfo.valueChainEntryName}
              entryId={popupInfo.valueChainEntryId}
              entryName={popupInfo.valueChainEntryName}
              user={userFlow}
              onSaveSuccess={() => {
                setPopupInfo({ show: false, text: '' });
                setIsExpanded(false);
                setShowAssessment(false);
              }}
            />
          ) : (
            <ExpandedCapabilityView
              valueChainName={popupInfo.frameName}
              capabilityName={popupInfo.capName}
              description={popupInfo.text}
              onAssess={() => setShowAssessment(true)}
            />
          )
        ) : (
          popupInfo.text
        )}
        {/* Only show expand button if not gauge popup */}
        {popupInfo.popupStep !== 'gauge' && (
          <button
            onClick={() => {
              setIsExpanded(exp => {
                const next = !exp;
                setPopupInfo(info => ({
                  ...info,
                  popupStep: next ? 'expanded' : 'description'
                }));
                return next;
              });
            }}
            style={{
              position: 'absolute',
              top: 0,
              right: 36,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: 0,
              background: 'transparent',
              border: 'none',
              fontSize: 22,
              lineHeight: 1,
              color: '#888',
              cursor: 'pointer',
              fontWeight: 700,
              zIndex: 4000,
              transform: 'translateY(1px)'
            }}
            aria-label="Expand"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            ⛶
          </button>
        )}
        <button
          onClick={() => {
            setPopupInfo({ show: false, text: '' });
            setIsExpanded(false); // Reset expand state on close
            setShowAssessment(false); // Reset assessment state on close
          }}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 0,
            background: 'transparent',
            border: 'none',
            fontSize: 22,
            lineHeight: 1,
            color: '#888',
            cursor: 'pointer',
            fontWeight: 700,
            zIndex: 4000,
          }}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default CapabilityPopupModal;
