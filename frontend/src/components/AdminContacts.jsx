import { apiUrl } from '../config/api.js';
import { Archive, ArrowLeft, Download, Inbox, Mail, Phone, RefreshCw, Search, Undo2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const statusFilters = [
  { label: '전체', value: 'all' },
  { label: '신규', value: 'new' },
  { label: '확인 완료', value: 'checked' },
  { label: '처리 완료', value: 'done' },
];

function AdminContacts() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [loginLocked, setLoginLocked] = useState(false);
  const [unlockCode, setUnlockCode] = useState('');
  const [unlockMessage, setUnlockMessage] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [unlockCodeRemainingSeconds, setUnlockCodeRemainingSeconds] = useState(0);

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [updatingContactId, setUpdatingContactId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [archiveMode, setArchiveMode] = useState(false);

  const filteredContacts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return contacts.filter((contact) => {
      const matchesStatus = archiveMode || statusFilter === 'all' || contact.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (keyword === '') {
        return true;
      }

      const searchableText = [
        contact.name,
        contact.phone,
        contact.email,
        contact.production_type,
        contact.budget_range,
        contact.message,
        contact.status,
        contact.source,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(keyword);
    });
  }, [archiveMode, contacts, searchTerm, statusFilter]);

  const checkAdminAuth = useCallback(async () => {
    setCheckingAuth(true);

    try {
      const response = await fetch(apiUrl('/api/admin/me.php'), {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });

      const result = await response.json();
      setAdminLoggedIn(Boolean(result.loggedIn));
    } catch (error) {
      console.error('Admin auth check error:', error);
      setAdminLoggedIn(false);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  const loadContacts = useCallback(async () => {
    if (!adminLoggedIn) {
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const contactsEndpoint = archiveMode
      ? apiUrl('/api/admin/archived-contacts.php')
      : apiUrl('/api/admin/contacts.php');

    try {
      const response = await fetch(contactsEndpoint, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });

      const result = await response.json();

      if (response.status === 401) {
        setAdminLoggedIn(false);
        setContacts([]);
        setSelectedContact(null);
        setErrorMessage('');
        return;
      }

      if (!response.ok || !result.success) {
        setErrorMessage(result.message || '문의 목록을 불러오지 못했습니다.');
        return;
      }

      const nextContacts = result.contacts || [];
      setContacts(nextContacts);
      setSelectedContact((currentContact) => {
        if (!currentContact) {
          return currentContact;
        }

        return nextContacts.find((contact) => Number(contact.id) === Number(currentContact.id)) || null;
      });
    } catch (error) {
      console.error('Admin contacts API error:', error);
      setErrorMessage('서버와 연결할 수 없습니다. PHP 백엔드 서버가 실행 중인지 확인해주세요.');
    } finally {
      setLoading(false);
    }
  }, [adminLoggedIn, archiveMode]);

  const loginAdmin = async (event) => {
    event.preventDefault();

    setLoginErrorMessage('');
    setUnlockMessage('');
    setLoggingIn(true);

    try {
      const response = await fetch(apiUrl('/api/admin/login.php'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          password: adminPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (response.status === 423 || result.locked) {
          setLoginLocked(true);
          setUnlockCodeRemainingSeconds(Number(result.unlockCodeRemainingSeconds || 0));
          setUnlockCode('');
          setUnlockMessage(
            result.unlockCodeExpired
              ? '잠금 해제 코드가 만료되었습니다. 코드 다시 받기를 눌러주세요.'
              : '이메일로 발송된 6자리 잠금 해제 코드를 입력해주세요.'
          );
        }

        setLoginErrorMessage(result.message || '관리자 로그인에 실패했습니다.');
        return;
      }

      setAdminPassword('');
      setLoginLocked(false);
      setUnlockCode('');
      setUnlockMessage('');
      setUnlockCodeRemainingSeconds(0);
      setAdminLoggedIn(true);
    } catch (error) {
      console.error('Admin login error:', error);
      setLoginErrorMessage('서버와 연결할 수 없습니다. PHP 백엔드 서버가 실행 중인지 확인해주세요.');
    } finally {
      setLoggingIn(false);
    }
  };

  const unlockAdminLogin = async (event) => {
    event.preventDefault();

    setUnlocking(true);
    setUnlockMessage('');
    setLoginErrorMessage('');

    try {
      const response = await fetch(apiUrl('/api/admin/unlock-login.php'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          unlockCode,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setUnlockMessage(result.message || '잠금 해제에 실패했습니다.');
        return;
      }

      setLoginLocked(false);
      setUnlockCode('');
      setUnlockCodeRemainingSeconds(0);
      setLoginErrorMessage('');
      setUnlockMessage(result.message || '잠금이 해제되었습니다. 관리자 비밀번호로 다시 로그인해주세요.');
    } catch (error) {
      console.error('Admin unlock error:', error);
      setUnlockMessage('서버와 연결할 수 없습니다. PHP 백엔드 서버가 실행 중인지 확인해주세요.');
    } finally {
      setUnlocking(false);
    }
  };

  const resendUnlockCode = async () => {
    setUnlocking(true);
    setUnlockMessage('');
    setLoginErrorMessage('');

    try {
      const response = await fetch(apiUrl('/api/admin/resend-unlock-code.php'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setUnlockMessage(result.message || '잠금 해제 코드 재발송에 실패했습니다.');
        return;
      }

      setUnlockCode('');
      setUnlockCodeRemainingSeconds(Number(result.unlockCodeRemainingSeconds || 0));
      setUnlockMessage(result.message || '잠금 해제 코드를 다시 발송했습니다.');
    } catch (error) {
      console.error('Resend unlock code error:', error);
      setUnlockMessage('서버와 연결할 수 없습니다. PHP 백엔드 서버가 실행 중인지 확인해주세요.');
    } finally {
      setUnlocking(false);
    }
  };

  const logoutAdmin = async () => {
    try {
      await fetch(apiUrl('/api/admin/logout.php'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });
    } catch (error) {
      console.error('Admin logout error:', error);
    } finally {
      setAdminLoggedIn(false);
      setContacts([]);
      setSelectedContact(null);
      setArchiveMode(false);
      setStatusFilter('all');
      setSearchTerm('');
    }
  };

  const updateContactStatus = async (contactId, status) => {
    const currentContact = contacts.find((contact) => Number(contact.id) === Number(contactId));

    if (currentContact?.status === status) {
      return true;
    }

    setUpdatingContactId(contactId);

    try {
      const response = await fetch(apiUrl('/api/admin/update-contact-status.php'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          id: contactId,
          status,
        }),
      });

      const result = await response.json();

      if (response.status === 401) {
        setAdminLoggedIn(false);
        setContacts([]);
        setSelectedContact(null);
        alert(result.message || '관리자 로그인이 필요합니다.');
        return false;
      }

      if (!response.ok || !result.success) {
        alert(result.message || '문의 상태 변경에 실패했습니다.');
        return false;
      }

      setContacts((currentContacts) =>
        currentContacts.map((contact) =>
          Number(contact.id) === Number(contactId)
            ? {
              ...contact,
              status,
            }
            : contact
        )
      );

      setSelectedContact((currentContact) => {
        if (!currentContact || Number(currentContact.id) !== Number(contactId)) {
          return currentContact;
        }

        return {
          ...currentContact,
          status,
        };
      });

      return true;
    } catch (error) {
      console.error('Update contact status API error:', error);
      alert('서버와 연결할 수 없습니다. PHP 백엔드 서버가 실행 중인지 확인해주세요.');
      return false;
    } finally {
      setUpdatingContactId(null);
    }
  };

  const archiveContact = async (contactId, contactName) => {
    const confirmed = window.confirm(
      `"${contactName}" 문의를 보관하시겠습니까?\n보관된 문의는 기본 목록에서 숨겨집니다.`
    );

    if (!confirmed) {
      return;
    }

    const updated = await updateContactStatus(contactId, 'archived');

    if (!updated) {
      return;
    }

    setContacts((currentContacts) =>
      currentContacts.filter((contact) => Number(contact.id) !== Number(contactId))
    );
    setSelectedContact(null);
  };

  const restoreContact = async (contactId, contactName) => {
    const confirmed = window.confirm(`"${contactName}" 문의를 신규 상태로 복구하시겠습니까?`);

    if (!confirmed) {
      return;
    }

    const updated = await updateContactStatus(contactId, 'new');

    if (!updated) {
      return;
    }

    setContacts((currentContacts) =>
      currentContacts.filter((contact) => Number(contact.id) !== Number(contactId))
    );
    setSelectedContact(null);
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setSearchTerm('');
  };

  const openContactDetail = (contact) => {
    setSelectedContact(contact);
  };

  const closeContactDetail = () => {
    setSelectedContact(null);
  };

  const toggleArchiveMode = () => {
    setArchiveMode((current) => !current);
    setSelectedContact(null);
    setStatusFilter('all');
    setSearchTerm('');
  };

  const downloadFilteredContactsCsv = () => {
    if (filteredContacts.length === 0) {
      alert('다운로드할 문의가 없습니다.');
      return;
    }

    const headers = [
      '접수번호',
      '상태',
      '이름/회사명',
      '연락처',
      '이메일',
      '제작 유형',
      '예산 범위',
      '문의 내용',
      '접수 경로',
      '접수일',
      '수정일',
    ];

    const rows = filteredContacts.map((contact) => [
      contact.id,
      renderStatusLabel(contact.status),
      contact.name,
      toExcelText(contact.phone),
      toExcelText(contact.email || ''),
      contact.production_type || '',
      toExcelText(contact.budget_range || ''),
      normalizeCsvText(contact.message || ''),
      contact.source || '',
      toExcelText(formatDateTime(contact.created_at)),
      toExcelText(formatDateTime(contact.updated_at)),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsvField).join(','))
      .join('\r\n');

    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateString = new Date().toISOString().slice(0, 10);
    const modeName = archiveMode ? 'archived-contacts' : 'contacts';

    link.href = url;
    link.download = `bdproduction-${modeName}-${dateString}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  useEffect(() => {
    if (adminLoggedIn) {
      loadContacts();
    }
  }, [adminLoggedIn, loadContacts]);

  useEffect(() => {
    if (!loginLocked || unlockCodeRemainingSeconds <= 0) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setUnlockCodeRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [loginLocked, unlockCodeRemainingSeconds]);

  useEffect(() => {
    if (!selectedContact) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedContact(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedContact]);

  if (checkingAuth) {
    return (
      <main className="admin-page">
        <section className="admin-login-panel">
          <p className="eyebrow">ADMIN</p>
          <h1>관리자 확인 중</h1>
          <p>로그인 상태를 확인하고 있습니다.</p>
        </section>
      </main>
    );
  }

  if (!adminLoggedIn) {
    return (
      <main className="admin-page">
        <section className="admin-login-panel">
          <p className="eyebrow">ADMIN LOGIN</p>
          <h1>{loginLocked ? '로그인 잠금 해제' : '관리자 로그인'}</h1>
          <p>
            {loginLocked
              ? '이메일로 발송된 잠금 해제 코드를 입력한 뒤 관리자 비밀번호로 다시 로그인해주세요.'
              : '문의 목록을 확인하려면 관리자 비밀번호를 입력해주세요.'}
          </p>

          {loginErrorMessage && <div className="admin-error-card">{loginErrorMessage}</div>}

          {unlockMessage && (
            <div className={loginLocked ? 'admin-lock-card' : 'admin-state-card'}>
              {unlockMessage}
            </div>
          )}

          {loginLocked ? (
            <form className="admin-login-form" onSubmit={unlockAdminLogin}>
              <div className="admin-lock-card">
                <strong>관리자 로그인이 잠겼습니다.</strong>
                <span>이메일로 발송된 6자리 잠금 해제 코드를 입력해주세요.</span>
                {unlockCodeRemainingSeconds > 0 && (
                  <span>코드 만료까지 {formatRemainingTime(unlockCodeRemainingSeconds)} 남았습니다.</span>
                )}
              </div>

              <label>
                잠금 해제 코드
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  value={unlockCode}
                  onChange={(event) => setUnlockCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6자리 코드 입력"
                  required
                  disabled={unlocking}
                />
              </label>

              <button className="primary-button" type="submit" disabled={unlocking || unlockCode.length < 6}>
                {unlocking ? '확인 중...' : '잠금 해제'}
              </button>

              <button
                className="admin-archive-toggle"
                type="button"
                onClick={resendUnlockCode}
                disabled={unlocking}
              >
                코드 다시 받기
              </button>
            </form>
          ) : (
            <form className="admin-login-form" onSubmit={loginAdmin}>
              <label>
                관리자 비밀번호
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                  placeholder="관리자 비밀번호 입력"
                  required
                  disabled={loggingIn}
                />
              </label>

              <button className="primary-button" type="submit" disabled={loggingIn}>
                {loggingIn ? '로그인 중...' : '관리자 로그인'}
              </button>
            </form>
          )}

          <a className="admin-back-link admin-login-back" href="/">
            홈페이지로 돌아가기
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <div className="admin-topbar">
          <a className="admin-back-link" href="/">
            <ArrowLeft size={18} />
            홈페이지로 돌아가기
          </a>

          <div className="admin-topbar-actions">
            <button
              className={`admin-archive-toggle ${archiveMode ? 'is-active' : ''}`}
              type="button"
              onClick={toggleArchiveMode}
            >
              <Archive size={17} />
              {archiveMode ? '기본 목록 보기' : '보관함 보기'}
            </button>

            <button
              className="admin-refresh-button"
              type="button"
              onClick={downloadFilteredContactsCsv}
              disabled={filteredContacts.length === 0}
            >
              <Download size={17} />
              CSV 다운로드
            </button>

            <button className="admin-refresh-button" type="button" onClick={loadContacts}>
              <RefreshCw size={17} />
              새로고침
            </button>

            <button className="admin-logout-button" type="button" onClick={logoutAdmin}>
              로그아웃
            </button>
          </div>
        </div>

        <div className="admin-heading">
          <p className="eyebrow">{archiveMode ? 'ARCHIVED CONTACTS' : 'ADMIN CONTACTS'}</p>
          <h1>{archiveMode ? '보관된 문의' : '문의 접수 목록'}</h1>
          <p>
            {archiveMode
              ? '보관 처리된 문의를 확인하고 필요한 경우 신규 문의로 복구할 수 있습니다.'
              : '홈페이지 문의 폼으로 접수된 고객 상담 요청을 확인합니다. 상태별 필터와 키워드 검색으로 문의를 빠르게 찾을 수 있습니다.'}
          </p>
        </div>

        <div className="admin-summary-grid">
          <div>
            <span>{archiveMode ? '보관 문의' : '전체 문의'}</span>
            <strong>{contacts.length}</strong>
          </div>
          <div>
            <span>현재 표시</span>
            <strong>{filteredContacts.length}</strong>
          </div>
          <div>
            <span>{archiveMode ? '복구 가능' : '처리 완료'}</span>
            <strong>
              {archiveMode
                ? contacts.length
                : contacts.filter((contact) => contact.status === 'done').length}
            </strong>
          </div>
        </div>

        <div className="admin-filter-panel">
          <div className="admin-search-box">
            <Search size={18} />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="이름, 연락처, 이메일, 문의 내용으로 검색"
            />
          </div>

          {!archiveMode && (
            <div className="admin-filter-tabs">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  className={statusFilter === filter.value ? 'is-active' : ''}
                  onClick={() => setStatusFilter(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          )}

          {(searchTerm || statusFilter !== 'all') && (
            <button className="admin-reset-filter-button" type="button" onClick={resetFilters}>
              <X size={16} />
              필터 초기화
            </button>
          )}
        </div>

        {loading && (
          <div className="admin-state-card">
            <RefreshCw size={22} />
            문의 목록을 불러오는 중입니다.
          </div>
        )}

        {errorMessage && <div className="admin-error-card">{errorMessage}</div>}

        {!loading && !errorMessage && contacts.length === 0 && (
          <div className="admin-empty-card">
            <Inbox size={26} />
            {archiveMode ? '보관된 문의가 없습니다.' : '아직 접수된 문의가 없습니다.'}
          </div>
        )}

        {!loading && !errorMessage && contacts.length > 0 && filteredContacts.length === 0 && (
          <div className="admin-empty-card">
            <Inbox size={26} />
            조건에 맞는 문의가 없습니다.
          </div>
        )}

        {!loading && !errorMessage && filteredContacts.length > 0 && (
          <div className="admin-contact-list">
            {filteredContacts.map((contact) => (
              <article
                className="admin-contact-card"
                key={contact.id}
                role="button"
                tabIndex={0}
                onClick={() => openContactDetail(contact)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openContactDetail(contact);
                  }
                }}
              >
                <div className="admin-contact-header">
                  <div>
                    <span className="admin-contact-id">#{contact.id}</span>
                    <h2>{contact.name}</h2>
                  </div>

                  <div className="admin-status-area">
                    <span className={`admin-status-badge status-${contact.status}`}>
                      {renderStatusLabel(contact.status)}
                    </span>

                    {!archiveMode ? (
                      <div className="admin-status-actions">
                        <button
                          type="button"
                          className={contact.status === 'new' ? 'is-active' : ''}
                          disabled={updatingContactId === contact.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            updateContactStatus(contact.id, 'new');
                          }}
                        >
                          신규
                        </button>

                        <button
                          type="button"
                          className={contact.status === 'checked' ? 'is-active' : ''}
                          disabled={updatingContactId === contact.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            updateContactStatus(contact.id, 'checked');
                          }}
                        >
                          확인
                        </button>

                        <button
                          type="button"
                          className={contact.status === 'done' ? 'is-active' : ''}
                          disabled={updatingContactId === contact.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            updateContactStatus(contact.id, 'done');
                          }}
                        >
                          완료
                        </button>

                        <button
                          type="button"
                          className="is-danger"
                          disabled={updatingContactId === contact.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            archiveContact(contact.id, contact.name);
                          }}
                        >
                          <Archive size={13} />
                          보관
                        </button>
                      </div>
                    ) : (
                      <div className="admin-status-actions">
                        <button
                          type="button"
                          className="is-restore"
                          disabled={updatingContactId === contact.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            restoreContact(contact.id, contact.name);
                          }}
                        >
                          <Undo2 size={13} />
                          복구
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="admin-contact-meta">
                  <p>
                    <Phone size={15} />
                    {contact.phone}
                  </p>

                  {contact.email && (
                    <p>
                      <Mail size={15} />
                      {contact.email}
                    </p>
                  )}
                </div>

                <div className="admin-contact-preview">
                  <div>
                    <span>제작 유형</span>
                    <strong>{contact.production_type || '-'}</strong>
                  </div>

                  <div>
                    <span>{archiveMode ? '보관일' : '접수일'}</span>
                    <strong>
                      {formatDateTime(archiveMode ? contact.updated_at : contact.created_at)}
                    </strong>
                  </div>
                </div>

                <div className="admin-message-preview">
                  <span>문의 미리보기</span>
                  <p>{contact.message}</p>
                </div>

                <div className="admin-card-hint">
                  클릭해서 상세 내용을 확인하세요.
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="admin-warning">
          현재 관리자 화면은 로컬 개발용입니다. 실제 배포 전에는 HTTPS, 운영 도메인 CORS, 관리자 계정 정책을 점검해야 합니다.
        </div>
      </section>

      {selectedContact && (
        <ContactDetailModal
          contact={selectedContact}
          archiveMode={archiveMode}
          updatingContactId={updatingContactId}
          onClose={closeContactDetail}
          onUpdateStatus={updateContactStatus}
          onArchive={archiveContact}
          onRestore={restoreContact}
        />
      )}
    </main>
  );
}


function ContactDetailModal({
  contact,
  archiveMode,
  updatingContactId,
  onClose,
  onUpdateStatus,
  onArchive,
  onRestore,
}) {
  const isUpdating = Number(updatingContactId) === Number(contact.id);

  return (
    <div className="admin-detail-backdrop" onClick={onClose}>
      <section className="admin-detail-modal" onClick={(event) => event.stopPropagation()}>
        <div className="admin-detail-header">
          <div>
            <span>접수번호 #{contact.id}</span>
            <h2>{contact.name}</h2>
          </div>

          <button type="button" className="admin-detail-close" onClick={onClose} aria-label="상세 모달 닫기">
            <X size={18} />
            닫기
          </button>
        </div>

        <div className="admin-detail-status-row">
          <span className={`admin-status-badge status-${contact.status}`}>
            {renderStatusLabel(contact.status)}
          </span>

          <span className="admin-detail-date">
            {formatDateTime(archiveMode ? contact.updated_at : contact.created_at)}
          </span>
        </div>

        <div className="admin-detail-grid">
          <DetailItem label="이름 / 회사명" value={contact.name} />
          <DetailItem label="연락처" value={contact.phone} />
          <DetailItem label="이메일" value={contact.email || '-'} />
          <DetailItem label="제작 유형" value={contact.production_type || '-'} />
          <DetailItem label="예산 범위" value={contact.budget_range || '-'} />
          <DetailItem label="접수 경로" value={contact.source || 'website'} />
        </div>

        <div className="admin-detail-message">
          <span>문의 내용</span>
          <p>{contact.message}</p>
        </div>

        <div className="admin-detail-actions">
          {!archiveMode ? (
            <>
              <button
                type="button"
                className={contact.status === 'new' ? 'is-active' : ''}
                disabled={isUpdating || contact.status === 'new'}
                onClick={() => onUpdateStatus(contact.id, 'new')}
              >
                신규
              </button>

              <button
                type="button"
                className={contact.status === 'checked' ? 'is-active' : ''}
                disabled={isUpdating || contact.status === 'checked'}
                onClick={() => onUpdateStatus(contact.id, 'checked')}
              >
                확인 완료
              </button>

              <button
                type="button"
                className={contact.status === 'done' ? 'is-active' : ''}
                disabled={isUpdating || contact.status === 'done'}
                onClick={() => onUpdateStatus(contact.id, 'done')}
              >
                처리 완료
              </button>

              <button
                type="button"
                className="danger"
                disabled={isUpdating}
                onClick={() => onArchive(contact.id, contact.name)}
              >
                <Archive size={14} />
                보관
              </button>
            </>
          ) : (
            <button type="button" disabled={isUpdating} onClick={() => onRestore(contact.id, contact.name)}>
              <Undo2 size={14} />
              신규로 복구
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="admin-detail-item">
      <span>{label}</span>
      <strong>{value || '-'}</strong>
    </div>
  );
}

function renderStatusLabel(status) {
  if (status === 'checked') {
    return '확인 완료';
  }

  if (status === 'done') {
    return '처리 완료';
  }

  if (status === 'archived') {
    return '보관됨';
  }

  return '신규 문의';
}

function formatRemainingTime(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  if (minutes <= 0) {
    return `${remainingSeconds}초`;
  }

  return `${minutes}분 ${remainingSeconds}초`;
}

function formatDateTime(value) {
  if (!value) {
    return '-';
  }

  return String(value).replace('T', ' ').slice(0, 19);
}

function normalizeCsvText(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value)
    .replace(/\r?\n|\r/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toExcelText(value) {
  const normalizedValue = normalizeCsvText(value);

  if (normalizedValue === '') {
    return '';
  }

  return `\t${normalizedValue}`;
}

function escapeCsvField(value) {
  const normalizedValue = value === null || value === undefined
    ? ''
    : String(value);

  const protectedValue = protectCsvFormula(normalizedValue);

  if (/[",\n\r]/.test(protectedValue)) {
    return `"${protectedValue.replace(/"/g, '""')}"`;
  }

  return protectedValue;
}

function protectCsvFormula(value) {
  if (value === '') {
    return '';
  }

  const trimmedValue = String(value).trimStart();

  if (/^[=+\-@]/.test(trimmedValue)) {
    return `'${value}`;
  }

  return value;
}

export default AdminContacts;
