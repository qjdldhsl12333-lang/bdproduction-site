import { apiUrl } from '../config/api.js';
import { ArrowLeft, Eye, EyeOff, Loader2, Plus, RefreshCw, Save, Star, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const emptyPortfolioForm = {
  id: null,
  title: '',
  client: '',
  category: '',
  description: '',
  thumbnail_url: '',
  youtube_video_id: '',
  badge: '',
  is_featured: true,
  featured_order: 0,
  is_active: true,
  display_order: 0,
};

function normalizeFormItem(item) {
  return {
    id: item.id ?? null,
    title: item.title || '',
    client: item.client || '',
    category: item.category || '',
    description: item.description || '',
    thumbnail_url: item.thumbnail_url || item.thumbnailUrl || '',
    youtube_video_id: item.youtube_video_id || item.youtubeVideoId || item.video_id || '',
    badge: item.badge || '',
    is_featured: Boolean(item.is_featured ?? item.isFeatured),
    featured_order: Number(item.featured_order ?? item.featuredOrder ?? 0),
    is_active: Boolean(item.is_active ?? item.isActive ?? true),
    display_order: Number(item.display_order ?? item.displayOrder ?? 0),
  };
}

function AdminPortfolioManager() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyPortfolioForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const firstOrder = Number(a.display_order ?? a.displayOrder ?? 0);
      const secondOrder = Number(b.display_order ?? b.displayOrder ?? 0);

      if (firstOrder !== secondOrder) {
        return firstOrder - secondOrder;
      }

      return Number(a.id) - Number(b.id);
    });
  }, [items]);

  const summary = useMemo(() => {
    return {
      total: items.length,
      active: items.filter((item) => item.is_active ?? item.isActive).length,
      featured: items.filter((item) => item.is_featured ?? item.isFeatured).length,
    };
  }, [items]);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(apiUrl('/api/admin/portfolio-items.php'), {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMessage(result.message || '포트폴리오 목록을 불러오지 못했습니다.');
        return;
      }

      setItems(result.items || []);
    } catch (error) {
      console.error('Admin portfolio load error:', error);
      setErrorMessage('포트폴리오 관리 API와 연결할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const updateForm = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyPortfolioForm);
    setNoticeMessage('');
    setErrorMessage('');
  };

  const editItem = (item) => {
    setForm(normalizeFormItem(item));
    setNoticeMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitForm = async (event) => {
    event.preventDefault();

    setSaving(true);
    setErrorMessage('');
    setNoticeMessage('');

    const action = form.id ? 'update' : 'create';

    try {
      const response = await fetch(apiUrl('/api/admin/portfolio-items.php'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          ...form,
          action,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMessage(result.message || '포트폴리오 저장에 실패했습니다.');
        return;
      }

      setNoticeMessage(result.message || '포트폴리오가 저장되었습니다.');
      setForm(emptyPortfolioForm);
      await loadItems();
    } catch (error) {
      console.error('Admin portfolio save error:', error);
      setErrorMessage('포트폴리오 저장 API와 연결할 수 없습니다.');
    } finally {
      setSaving(false);
    }
  };

  const updateVisibility = async (item, nextActive) => {
    setSaving(true);
    setErrorMessage('');
    setNoticeMessage('');

    try {
      const response = await fetch(apiUrl('/api/admin/portfolio-items.php'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          action: nextActive ? 'restore' : 'hide',
          id: item.id,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMessage(result.message || '노출 상태 변경에 실패했습니다.');
        return;
      }

      setNoticeMessage(result.message || '노출 상태가 변경되었습니다.');
      await loadItems();
    } catch (error) {
      console.error('Admin portfolio visibility error:', error);
      setErrorMessage('노출 상태 변경 API와 연결할 수 없습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="admin-page admin-portfolio-page">
      <section className="admin-shell">
        <div className="admin-topbar">
          <a className="admin-back-link" href="/admin">
            <ArrowLeft size={18} />
            문의 관리로 돌아가기
          </a>

          <div className="admin-topbar-actions">
            <a className="admin-archive-toggle" href="/portfolio" target="_blank" rel="noreferrer">
              <Eye size={17} />
              전체 포트폴리오 보기
            </a>

            <button className="admin-refresh-button" type="button" onClick={loadItems}>
              <RefreshCw size={17} />
              새로고침
            </button>
          </div>
        </div>

        <div className="admin-heading">
          <p className="eyebrow">PORTFOLIO CMS</p>
          <h1>포트폴리오 관리</h1>
          <p>
            메인 대표작 여부, 카테고리, 노출 순서, YouTube ID를 관리하는 1차 CMS 화면입니다.
            실제 YouTube API 연동 전에도 수동 포트폴리오를 등록하고 전체 포트폴리오 페이지에 반영할 수 있습니다.
          </p>
        </div>

        <div className="admin-summary-grid">
          <div>
            <span>전체 포트폴리오</span>
            <strong>{summary.total}</strong>
          </div>
          <div>
            <span>노출 중</span>
            <strong>{summary.active}</strong>
          </div>
          <div>
            <span>메인 대표작</span>
            <strong>{summary.featured}</strong>
          </div>
        </div>

        {noticeMessage && (
          <div className="admin-state-card">
            <Save size={18} />
            {noticeMessage}
          </div>
        )}

        {errorMessage && (
          <div className="admin-error-card">
            {errorMessage}
          </div>
        )}

        <section className="admin-portfolio-editor">
          <div className="admin-portfolio-editor-heading">
            <div>
              <p className="eyebrow">{form.id ? 'EDIT PORTFOLIO' : 'ADD PORTFOLIO'}</p>
              <h2>{form.id ? '포트폴리오 수정' : '새 포트폴리오 추가'}</h2>
            </div>

            {form.id && (
              <button type="button" onClick={resetForm}>
                <X size={16} />
                수정 취소
              </button>
            )}
          </div>

          <form className="admin-portfolio-form" onSubmit={submitForm}>
            <label>
              제목
              <input
                type="text"
                value={form.title}
                onChange={(event) => updateForm('title', event.target.value)}
                placeholder="예: Warner Music Korea MV Production"
                required
              />
            </label>

            <label>
              클라이언트 / 브랜드
              <input
                type="text"
                value={form.client}
                onChange={(event) => updateForm('client', event.target.value)}
                placeholder="예: 워너뮤직 코리아"
              />
            </label>

            <label>
              카테고리
              <input
                type="text"
                value={form.category}
                onChange={(event) => updateForm('category', event.target.value)}
                placeholder="예: Music Video"
              />
            </label>

            <label>
              배지
              <input
                type="text"
                value={form.badge}
                onChange={(event) => updateForm('badge', event.target.value)}
                placeholder="예: MV, CF, TV"
              />
            </label>

            <label className="admin-portfolio-form-wide">
              설명
              <textarea
                value={form.description}
                onChange={(event) => updateForm('description', event.target.value)}
                placeholder="포트폴리오 설명을 입력하세요."
                rows={4}
              />
            </label>

            <label className="admin-portfolio-form-wide">
              썸네일 URL
              <input
                type="url"
                value={form.thumbnail_url}
                onChange={(event) => updateForm('thumbnail_url', event.target.value)}
                placeholder="https://..."
              />
            </label>

            <label>
              YouTube ID 또는 URL
              <input
                type="text"
                value={form.youtube_video_id}
                onChange={(event) => updateForm('youtube_video_id', event.target.value)}
                placeholder="영상 ID 또는 YouTube URL"
              />
            </label>

            <label>
              전체 노출 순서
              <input
                type="number"
                value={form.display_order}
                onChange={(event) => updateForm('display_order', Number(event.target.value))}
              />
            </label>

            <label>
              대표작 노출 순서
              <input
                type="number"
                value={form.featured_order}
                onChange={(event) => updateForm('featured_order', Number(event.target.value))}
              />
            </label>

            <div className="admin-portfolio-checks">
              <label>
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(event) => updateForm('is_featured', event.target.checked)}
                />
                메인 대표작으로 노출
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) => updateForm('is_active', event.target.checked)}
                />
                전체 포트폴리오에 노출
              </label>
            </div>

            <button className="primary-button admin-portfolio-submit" type="submit" disabled={saving}>
              {saving ? <Loader2 size={17} /> : <Plus size={17} />}
              {form.id ? '수정 저장' : '포트폴리오 추가'}
            </button>
          </form>
        </section>

        <section className="admin-portfolio-list-section">
          <div className="admin-portfolio-list-heading">
            <div>
              <p className="eyebrow">PORTFOLIO LIST</p>
              <h2>등록된 포트폴리오</h2>
            </div>
          </div>

          {loading && (
            <div className="admin-state-card">
              <Loader2 size={18} />
              포트폴리오 목록을 불러오는 중입니다.
            </div>
          )}

          {!loading && sortedItems.length === 0 && (
            <div className="admin-empty-card">
              아직 등록된 포트폴리오가 없습니다.
            </div>
          )}

          {!loading && sortedItems.length > 0 && (
            <div className="admin-portfolio-list">
              {sortedItems.map((item) => {
                const isActive = Boolean(item.is_active ?? item.isActive);
                const isFeatured = Boolean(item.is_featured ?? item.isFeatured);

                return (
                  <article className={`admin-portfolio-card ${!isActive ? 'is-hidden' : ''}`} key={item.id}>
                    <div className="admin-portfolio-thumb">
                      {item.thumbnail_url ? (
                        <img src={item.thumbnail_url} alt={item.title} loading="lazy" />
                      ) : (
                        <span>BD</span>
                      )}
                    </div>

                    <div className="admin-portfolio-card-body">
                      <div className="admin-portfolio-card-meta">
                        <span>{item.category || '미분류'}</span>
                        {item.badge && <strong>{item.badge}</strong>}
                        {isFeatured && (
                          <em>
                            <Star size={13} />
                            대표작
                          </em>
                        )}
                      </div>

                      <h3>{item.title}</h3>
                      <p>{item.description || '설명이 없습니다.'}</p>

                      <div className="admin-portfolio-card-info">
                        <span>클라이언트: {item.client || '-'}</span>
                        <span>전체 순서: {item.display_order ?? item.displayOrder ?? 0}</span>
                        <span>대표 순서: {item.featured_order ?? item.featuredOrder ?? 0}</span>
                      </div>
                    </div>

                    <div className="admin-portfolio-card-actions">
                      <button type="button" onClick={() => editItem(item)}>
                        수정
                      </button>

                      <button
                        type="button"
                        className={isActive ? 'danger' : ''}
                        onClick={() => updateVisibility(item, !isActive)}
                        disabled={saving}
                      >
                        {isActive ? (
                          <>
                            <EyeOff size={15} />
                            숨김
                          </>
                        ) : (
                          <>
                            <Eye size={15} />
                            노출
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default AdminPortfolioManager;
