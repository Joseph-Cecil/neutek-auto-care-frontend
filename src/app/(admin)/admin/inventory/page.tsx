'use client';

import { useState, type FormEvent } from 'react';
import { TopProgress } from '@/components/ui/top-progress';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useCreatePart, useInventory, useReceiveStock, useRestockLow } from '@/hooks/useInventory';
import { ghsAmount, ghsToPesewas } from '@/lib/utils/format';
import type { StockStatus } from '@/lib/dto';

const STATUS_LABEL: Record<StockStatus, string> = {
  out_of_stock: 'Out of stock',
  low_stock: 'Low stock',
  in_stock: 'In stock',
};

function statusPill(status: StockStatus): string {
  if (status === 'out_of_stock') return 'pill bad';
  if (status === 'low_stock') return 'pill warn';
  return 'pill ok';
}

function moneyInput(value: string): number | null {
  if (!value.trim()) return null;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return ghsToPesewas(amount);
}

export default function AdminInventoryPage() {
  const [filter, setFilter] = useState<'all' | 'low'>('all');
  const [page, setPage] = useState(1);
  const list = useInventory(page, filter);
  const catalog = useInventory(1, 'all', 100);
  const create = useCreatePart();
  const receive = useReceiveStock();
  const restock = useRestockLow();
  const rows = list.data?.data ?? [];
  const summary = list.data?.summary;
  const waiting = (list.isPending && !list.data) || (catalog.isPending && !catalog.data);
  const failed = (list.isError && !list.data) || (catalog.isError && !catalog.data);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState('0');
  const [minimum, setMinimum] = useState('0');
  const [cost, setCost] = useState('');
  const [price, setPrice] = useState('');
  const [supplier, setSupplier] = useState('');
  const [receivePart, setReceivePart] = useState('');
  const [receiveQty, setReceiveQty] = useState('');
  const [formError, setFormError] = useState('');
  const [receiveError, setReceiveError] = useState('');

  const add = (event: FormEvent) => {
    event.preventDefault();
    const qty = Number(quantity);
    const min = Number(minimum);
    const costPesewas = moneyInput(cost);
    const pricePesewas = moneyInput(price);
    if (!name.trim() || !sku.trim() || !supplier.trim()) {
      setFormError('Enter the name, SKU, and supplier.');
      return;
    }
    if (!Number.isInteger(qty) || qty < 0 || !Number.isInteger(min) || min < 0) {
      setFormError('Quantity and minimum must be whole numbers, zero or more.');
      return;
    }
    if (costPesewas === null || pricePesewas === null) {
      setFormError('Enter the cost and the selling price.');
      return;
    }
    setFormError('');
    create.mutate(
      { name: name.trim(), sku: sku.trim(), quantity: qty, minimum: min, costPesewas, pricePesewas, supplier: supplier.trim() },
      {
        onSuccess: () => {
          setName('');
          setSku('');
          setQuantity('0');
          setMinimum('0');
          setCost('');
          setPrice('');
          setSupplier('');
        },
      },
    );
  };

  const receiveDelivery = (event: FormEvent) => {
    event.preventDefault();
    const qty = Number(receiveQty);
    if (!receivePart) {
      setReceiveError('Choose a part.');
      return;
    }
    if (!Number.isInteger(qty) || qty < 1) {
      setReceiveError('Enter how many arrived, above zero.');
      return;
    }
    setReceiveError('');
    receive.mutate(
      { id: receivePart, quantity: qty },
      { onSuccess: () => setReceiveQty('') },
    );
  };

  const catalogRows = catalog.data?.data ?? [];

  return (
    <>
      <TopProgress active={list.isFetching || catalog.isFetching || create.isPending || receive.isPending || restock.isPending} />
      {waiting ? <PageSkeleton kind="list" /> : (
        <div className="stack">
          <div className="pagehead">
            <div className="ttl">
              <h1>Inventory</h1>
              <p className="muted">Parts on the shelf, what is running low, and what each part earns. The shelf starts empty.</p>
            </div>
            <div className="row" role="group" aria-label="Filter">
              <button type="button" className={filter === 'all' ? 'btn primary' : 'btn'} aria-pressed={filter === 'all'} onClick={() => { setFilter('all'); setPage(1); }}>All parts</button>
              <button type="button" className={filter === 'low' ? 'btn primary' : 'btn'} aria-pressed={filter === 'low'} onClick={() => { setFilter('low'); setPage(1); }}>Needs restocking</button>
            </div>
          </div>
          {failed ? (
            <div className="banner" role="alert">Could not load inventory. Refresh the page to try again.</div>
          ) : (
            <>
              {(summary?.lowCount ?? 0) > 0 ? (
                <div className="banner warn row sb" role="status">
                  <span><b>{summary?.lowCount}</b> parts are at or below their minimum.</span>
                  <button type="button" className={restock.isPending ? 'btn sm nt-loading' : 'btn sm'} disabled={restock.isPending} onClick={() => restock.mutate()}>Restock low items</button>
                </div>
              ) : null}
              <div className="grid g2">
                <div className="card stack s">
                  <div className="faint sm">Parts tracked</div>
                  <p className="b">{summary?.items ?? 0}</p>
                  <p className="muted">{summary?.supplierCount ?? 0} suppliers</p>
                </div>
                <div className="card stack s">
                  <div className="faint sm">Stock value at cost (GHS)</div>
                  <p className="b">{ghsAmount(summary?.stockValuePesewas ?? 0)}</p>
                  <p className="muted">{summary?.averageMarginPercent === null || summary?.averageMarginPercent === undefined ? 'No selling value yet' : `Average margin ${summary.averageMarginPercent}%`}</p>
                </div>
              </div>
              {rows.length === 0 ? (
                <div className="empty">
                  <h2>{filter === 'low' ? 'Everything is stocked' : 'No parts yet'}</h2>
                  <p className="muted">{filter === 'low' ? 'No part is at or below its minimum.' : 'Add a part to start the shelf.'}</p>
                  {filter === 'low' ? <button type="button" className="btn" onClick={() => { setFilter('all'); setPage(1); }}>Show all parts</button> : null}
                </div>
              ) : (
                <div className="card flush">
                  <div className="tw">
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th>Part</th>
                          <th>In stock</th>
                          <th>Minimum</th>
                          <th>Cost</th>
                          <th>Price</th>
                          <th>Margin</th>
                          <th>Status</th>
                          <th>Restock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr key={row.id}>
                            <td>
                              <div className="two">
                                <b>{row.name}</b>
                                <span>{row.sku} · {row.supplier}</span>
                              </div>
                            </td>
                            <td className="b">{row.quantity}</td>
                            <td>{row.minimum}</td>
                            <td>{ghsAmount(row.cost_pesewas)}</td>
                            <td>{ghsAmount(row.price_pesewas)}</td>
                            <td>{row.margin_percent}%</td>
                            <td><span className={statusPill(row.stock_status)}>{STATUS_LABEL[row.stock_status]}</span></td>
                            <td>
                              <div className="row" style={{ gap: 8 }}>
                                <button type="button" className="btn sm" disabled={receive.isPending} onClick={() => receive.mutate({ id: row.id, quantity: 5 })}>+5</button>
                                <button type="button" className="btn sm" disabled={receive.isPending} onClick={() => receive.mutate({ id: row.id, quantity: 10 })}>+10</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {(list.data?.totalPages ?? 1) > 1 ? (
                <div className="row">
                  <button type="button" className="btn sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button>
                  <span className="muted">Page {page} of {list.data?.totalPages}</span>
                  <button type="button" className="btn sm" disabled={page >= (list.data?.totalPages ?? 1)} onClick={() => setPage((current) => current + 1)}>Next</button>
                </div>
              ) : null}
              <form className="card stack s" onSubmit={receiveDelivery} noValidate>
                <h2>Receive stock</h2>
                <p className="muted sm">Add a delivery to the shelf.</p>
                {receiveError ? <div className="errsum" role="alert">{receiveError}</div> : null}
                <div className="grid g2">
                  <div className="field">
                    <label htmlFor="rc-part">Part</label>
                    <select id="rc-part" className="input" value={receivePart} onChange={(event) => setReceivePart(event.target.value)}>
                      <option value="">Choose a part</option>
                      {catalogRows.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="rc-qty">Quantity received</label>
                    <input id="rc-qty" className="input" inputMode="numeric" value={receiveQty} onChange={(event) => setReceiveQty(event.target.value)} />
                  </div>
                </div>
                <div className="row end">
                  <button type="submit" className={receive.isPending ? 'btn primary nt-loading' : 'btn primary'} disabled={receive.isPending || catalogRows.length === 0}>Receive stock</button>
                </div>
              </form>
              <form className="card stack s" onSubmit={add} noValidate>
                <h2>Add a part</h2>
                <p className="muted sm">The prototype started with sample parts. A real shelf starts empty, so staff add the first part here.</p>
                {formError ? <div className="errsum" role="alert">{formError}</div> : null}
                <div className="grid g2">
                  <div className="field">
                    <label htmlFor="part-name">Name</label>
                    <input id="part-name" className="input" value={name} onChange={(event) => setName(event.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="part-sku">SKU</label>
                    <input id="part-sku" className="input" value={sku} onChange={(event) => setSku(event.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="part-qty">In stock</label>
                    <input id="part-qty" className="input" inputMode="numeric" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="part-min">Minimum</label>
                    <input id="part-min" className="input" inputMode="numeric" value={minimum} onChange={(event) => setMinimum(event.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="part-cost">Cost (GHS)</label>
                    <input id="part-cost" className="input" inputMode="decimal" value={cost} onChange={(event) => setCost(event.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="part-price">Price (GHS)</label>
                    <input id="part-price" className="input" inputMode="decimal" value={price} onChange={(event) => setPrice(event.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="part-supplier">Supplier</label>
                    <input id="part-supplier" className="input" value={supplier} onChange={(event) => setSupplier(event.target.value)} />
                  </div>
                </div>
                <div className="row end">
                  <button type="submit" className={create.isPending ? 'btn primary nt-loading' : 'btn primary'} disabled={create.isPending}>Save part</button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
