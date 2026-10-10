import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError, map } from 'rxjs';
import { Product, BidRecord } from '../model/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/product';
  private STORAGE_KEY = 'gmart_products_v2';
  private BIDS_KEY = 'gmart_user_bids_v2';

  // Reactive Signal for Zoneless Angular reactivity
  public productsSignal = signal<Product[]>([]);
  public activeBidsSignal = signal<{ productId: number; userBid: number; status: 'leading' | 'outbid' }[]>([]);

  // Curated antique seeds to ensure products always show up even when backend is restarted or empty
  private initialAntiques: Product[] = [
    {
      id: 1,
      name: '18th Century French Ormolu Mantel Clock',
      description: 'Exquisite Louis XVI gilt-bronze mantel clock featuring classical allegorical figures, porcelain enamel dial with Roman numerals, and 8-day chime movement.',
      imageUrl: '/assets/photo-1.avif',
      uom: 'piece',
      price: 1850.00,
      startingBid: 1200.00,
      currentBid: 1650.00,
      buyItNowPrice: 2200.00,
      bidCount: 8,
      highestBidder: 'Arthur Pendelton',
      isSold: false,
      auctionEndTime: new Date(Date.now() + 1000 * 60 * 42).toISOString(), // 42 mins from now
      category: 'Clocks & Horology',
      condition: 'Excellent Antique Condition',
      sellerName: 'Versailles Antiquaires',
      history: [
        { bidder: 'Arthur Pendelton', amount: 1650.00, time: '12 mins ago' },
        { bidder: 'Marcus Aurel', amount: 1500.00, time: '35 mins ago' },
        { bidder: 'Collector99', amount: 1350.00, time: '1 hr ago' }
      ]
    },
    {
      id: 2,
      name: 'Ming Dynasty Style Celadon Ceramic Vase',
      description: 'Hand-thrown porcelain vase with delicate craquelure jade-green celadon glaze, twin scrolled handles, and authentic underglaze mark.',
      imageUrl: '/assets/photo-2.avif',
      uom: 'piece',
      price: 890.00,
      startingBid: 550.00,
      currentBid: 820.00,
      buyItNowPrice: 1100.00,
      bidCount: 14,
      highestBidder: 'Jane Doe',
      isSold: false,
      auctionEndTime: new Date(Date.now() + 1000 * 60 * 18).toISOString(), // 18 mins from now
      category: 'Ceramics & Pottery',
      condition: 'Museum Grade',
      sellerName: 'Orient Relics',
      history: [
        { bidder: 'Jane Doe', amount: 820.00, time: '5 mins ago' },
        { bidder: 'AntiqueGallery', amount: 780.00, time: '22 mins ago' }
      ]
    },
    {
      id: 3,
      name: 'Victorian Mahogany Curio Display Cabinet',
      description: 'Carved solid mahogany display vitrine with hand-beveled curved glass panes, velvet-lined shelves, and brass lion-paw feet.',
      imageUrl: '/assets/photo-3.avif',
      uom: 'piece',
      price: 2400.00,
      startingBid: 1800.00,
      currentBid: 2400.00,
      buyItNowPrice: 2900.00,
      bidCount: 19,
      highestBidder: 'Lord Harrington',
      isSold: true, // Marked as SOLD with ended timer demonstration
      auctionEndTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // Ended 5 mins ago
      category: 'Furniture',
      condition: 'Restored Vintage',
      sellerName: 'Mayfair Antiquities',
      history: [
        { bidder: 'Lord Harrington', amount: 2400.00, time: '5 mins ago' },
        { bidder: 'Jane Doe', amount: 2250.00, time: '18 mins ago' }
      ]
    },
    {
      id: 4,
      name: 'Art Deco Sapphire & Diamond Filigree Brooch (c. 1925)',
      description: 'Platinum filigree geometric brooch set with a 2.4ct Ceylon natural sapphire framed by 36 old European-cut diamonds.',
      imageUrl: '/assets/photo-4.avif',
      uom: 'item',
      price: 3600.00,
      startingBid: 2500.00,
      currentBid: 3200.00,
      buyItNowPrice: 3800.00,
      bidCount: 11,
      highestBidder: 'Sophia Sterling',
      isSold: false,
      auctionEndTime: new Date(Date.now() + 1000 * 60 * 125).toISOString(), // ~2 hours from now
      category: 'Jewelry',
      condition: 'Flawless Vintage',
      sellerName: 'Geneva Estate Jewellers',
      history: [
        { bidder: 'Sophia Sterling', amount: 3200.00, time: '20 mins ago' },
        { bidder: 'Arthur Pendelton', amount: 2950.00, time: '40 mins ago' }
      ]
    },
    {
      id: 5,
      name: 'Imperial Brass Telescope on Teak Tripod',
      description: '19th-century maritime captain navigational refractor telescope with heavy brass barrel, optics intact, accompanied by adjustable solid teak tripod.',
      imageUrl: '/assets/photo-5.avif',
      uom: 'set',
      price: 950.00,
      startingBid: 600.00,
      currentBid: 910.00,
      buyItNowPrice: 1200.00,
      bidCount: 7,
      highestBidder: 'Captain Reynolds',
      isSold: false,
      auctionEndTime: new Date(Date.now() + 1000 * 60 * 55).toISOString(),
      category: 'Maritime & Scientific',
      condition: 'Authentic Patina',
      sellerName: 'Portsmouth Antiques',
      history: [
        { bidder: 'Captain Reynolds', amount: 910.00, time: '14 mins ago' }
      ]
    },
    {
      id: 6,
      name: '17th Century Silver Repoussé Chalice',
      description: 'Baroque ecclesiastical goblet crafted in 925 sterling silver with high-relief biblical vignettes and gilded cup interior.',
      imageUrl: '/assets/photo-6.avif',
      uom: 'piece',
      price: 1450.00,
      startingBid: 1100.00,
      currentBid: 1450.00,
      buyItNowPrice: 1800.00,
      bidCount: 16,
      highestBidder: 'St. James Guild',
      isSold: true, // Sold demonstration
      auctionEndTime: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      category: 'Silverware',
      condition: 'Fine Patina',
      sellerName: 'Salzburg Estate',
      history: [
        { bidder: 'St. James Guild', amount: 1450.00, time: '20 mins ago' }
      ]
    },
    {
      id: 7,
      name: 'Rare 1888 Mechanical Wind-Up Bird Music Box',
      description: 'Swiss singing bird automaton enclosed in an ornate engraved brass cage with working mechanical whistle movement and feathered miniature bird.',
      imageUrl: '/assets/photo-7.avif',
      uom: 'piece',
      price: 2100.00,
      startingBid: 1500.00,
      currentBid: 1950.00,
      buyItNowPrice: 2400.00,
      bidCount: 9,
      highestBidder: 'Arthur Pendelton',
      isSold: false,
      auctionEndTime: new Date(Date.now() + 1000 * 60 * 85).toISOString(),
      category: 'Automata & Music',
      condition: 'Fully Functional',
      sellerName: 'Geneva Clockwork Co.',
      history: [
        { bidder: 'Arthur Pendelton', amount: 1950.00, time: '8 mins ago' }
      ]
    },
    {
      id: 8,
      name: 'Illuminated Latin Manuscript Leaf on Vellum',
      description: 'Circa 1475 Book of Hours vellum leaf featuring gold leaf historiated initial, gothic calligraphy, and floral vine borders.',
      imageUrl: '/assets/photo-8.avif',
      uom: 'folio',
      price: 750.00,
      startingBid: 400.00,
      currentBid: 710.00,
      buyItNowPrice: 950.00,
      bidCount: 12,
      highestBidder: 'BibliophileArchive',
      isSold: false,
      auctionEndTime: new Date(Date.now() + 1000 * 60 * 210).toISOString(),
      category: 'Rare Books & Manuscripts',
      condition: 'Archivally Framed',
      sellerName: 'Oxford Rare Folios',
      history: [
        { bidder: 'BibliophileArchive', amount: 710.00, time: '30 mins ago' }
      ]
    }
  ];

  constructor(private http: HttpClient) {
    this.initFromStorage();
  }

  private initFromStorage(): void {
    const cached = localStorage.getItem(this.STORAGE_KEY);
    if (cached) {
      try {
        const parsed: Product[] = JSON.parse(cached);
        if (parsed && parsed.length > 0) {
          this.productsSignal.set(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to parse cached products', e);
      }
    }
    this.productsSignal.set(this.initialAntiques);
    this.saveToStorage(this.initialAntiques);
  }

  private saveToStorage(products: Product[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products));
    this.productsSignal.set(products);
  }

  public normalizeImageUrl(url?: string): string {
    if (!url || url.trim() === '') {
      return '/assets/photo-1.avif';
    }
    // Convert relative paths like '../../assets/photo-1.avif' or 'assets/photo-1.avif'
    if (url.includes('assets/')) {
      const filename = url.substring(url.indexOf('assets/'));
      return '/' + filename;
    }
    return url;
  }

  public getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      map((backendProducts) => {
        if (!backendProducts || backendProducts.length === 0) {
          return this.productsSignal();
        }

        // Merge backend products with auction metadata
        const currentStored = this.productsSignal();
        const merged: Product[] = backendProducts.map((bp) => {
          const existing = currentStored.find((e) => e.id === bp.id);
          const startingBid = bp.price > 0 ? Math.round(bp.price * 0.7) : 100;
          const currentBid = existing?.currentBid || bp.price || startingBid;
          const isSold = existing?.isSold ?? false;
          const endTime = existing?.auctionEndTime || new Date(Date.now() + 1000 * 60 * (30 + (bp.id * 15))).toISOString();

          return {
            ...bp,
            name: bp.name || (existing?.name ?? `Antique Item #${bp.id}`),
            description: bp.description || (existing?.description ?? 'Curated authentic antique collectible.'),
            imageUrl: this.normalizeImageUrl(bp.imageUrl || existing?.imageUrl),
            uom: bp.uom || existing?.uom || 'piece',
            price: bp.price || existing?.price || 150,
            startingBid: existing?.startingBid || startingBid,
            currentBid: currentBid,
            buyItNowPrice: existing?.buyItNowPrice || Math.round((bp.price || currentBid) * 1.3),
            bidCount: existing?.bidCount || (existing?.history?.length ?? 3),
            highestBidder: existing?.highestBidder || 'Arthur Pendelton',
            isSold: isSold,
            auctionEndTime: endTime,
            category: existing?.category || 'Curated Antique',
            condition: existing?.condition || 'Excellent Antique Condition',
            sellerName: existing?.sellerName || 'G-Mart Verified Seller',
            history: existing?.history || [
              { bidder: 'Arthur Pendelton', amount: currentBid, time: '10 mins ago' },
              { bidder: 'Jane Doe', amount: Math.round(currentBid * 0.9), time: '40 mins ago' }
            ]
          };
        });

        // Also append any locally listed items that might not have made it to backend yet
        for (const item of currentStored) {
          if (!merged.some((m) => m.id === item.id)) {
            merged.push(item);
          }
        }

        this.saveToStorage(merged);
        return merged;
      }),
      tap((merged) => {
        this.productsSignal.set(merged);
      }),
      catchError((err) => {
        console.warn('Backend currently unreachable, using local reactive catalog:', err);
        return of(this.productsSignal());
      })
    );
  }

  public getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      map((backendProduct) => {
        const stored = this.productsSignal().find((p) => p.id === id);
        if (stored) {
          return {
            ...stored,
            ...backendProduct,
            imageUrl: this.normalizeImageUrl(backendProduct.imageUrl || stored.imageUrl)
          };
        }
        return {
          ...backendProduct,
          imageUrl: this.normalizeImageUrl(backendProduct.imageUrl),
          startingBid: backendProduct.price * 0.7,
          currentBid: backendProduct.price,
          buyItNowPrice: backendProduct.price * 1.3,
          isSold: false,
          bidCount: 5,
          auctionEndTime: new Date(Date.now() + 1000 * 60 * 60).toISOString()
        };
      }),
      catchError(() => {
        const local = this.productsSignal().find((p) => p.id === id);
        if (local) return of(local);
        return of(this.initialAntiques[0]);
      })
    );
  }

  public createProduct(productData: Partial<Product>): Observable<Product> {
    const payload = {
      name: productData.name,
      description: productData.description,
      imageUrl: this.normalizeImageUrl(productData.imageUrl),
      uom: productData.uom || 'piece',
      price: productData.price || productData.startingBid || 100
    };

    return this.http.post<Product>(this.apiUrl, payload).pipe(
      map((createdBackendProduct) => {
        const newProduct: Product = {
          ...createdBackendProduct,
          imageUrl: this.normalizeImageUrl(createdBackendProduct.imageUrl || productData.imageUrl),
          startingBid: productData.startingBid || productData.price || 100,
          currentBid: productData.startingBid || productData.price || 100,
          buyItNowPrice: productData.buyItNowPrice || Math.round((productData.price || 100) * 1.4),
          bidCount: 0,
          highestBidder: 'None yet',
          isSold: false,
          auctionEndTime: productData.auctionEndTime || new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
          category: productData.category || 'Antique Collectible',
          condition: productData.condition || 'Mint Antique Condition',
          sellerName: productData.sellerName || 'Jane Doe',
          sellerEmail: productData.sellerEmail || 'jane.doe@example.com',
          history: []
        };
        return newProduct;
      }),
      catchError(() => {
        // Local synthesis if backend offline
        const syntheticId = Date.now();
        const synthesized: Product = {
          id: syntheticId,
          name: productData.name || 'Antique Listing',
          description: productData.description || 'Rare antique piece.',
          imageUrl: this.normalizeImageUrl(productData.imageUrl),
          uom: productData.uom || 'piece',
          price: productData.price || 250,
          startingBid: productData.startingBid || 200,
          currentBid: productData.startingBid || 200,
          buyItNowPrice: productData.buyItNowPrice || 350,
          bidCount: 0,
          highestBidder: 'None yet',
          isSold: false,
          auctionEndTime: productData.auctionEndTime || new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
          category: productData.category || 'Antiques & Oddities',
          condition: productData.condition || 'Collector Grade',
          sellerName: productData.sellerName || 'Jane Doe',
          sellerEmail: productData.sellerEmail || 'jane.doe@example.com',
          history: []
        };
        return of(synthesized);
      }),
      tap((fullProduct) => {
        const current = [...this.productsSignal()];
        current.unshift(fullProduct);
        this.saveToStorage(current);
      })
    );
  }

  public placeBid(productId: number, bidAmount: number, bidderName: string): boolean {
    const list = [...this.productsSignal()];
    const itemIndex = list.findIndex((p) => p.id === productId);
    if (itemIndex < 0) return false;

    const item = { ...list[itemIndex] };
    if (item.isSold) return false;

    item.currentBid = bidAmount;
    item.bidCount = (item.bidCount || 0) + 1;
    item.highestBidder = bidderName;

    const newRecord: BidRecord = {
      bidder: bidderName,
      amount: bidAmount,
      time: 'Just now'
    };
    item.history = [newRecord, ...(item.history || [])];

    list[itemIndex] = item;
    this.saveToStorage(list);

    // Track active bid
    this.recordUserBid(productId, bidAmount);
    return true;
  }

  public markAsSold(productId: number): void {
    const list = [...this.productsSignal()];
    const itemIndex = list.findIndex((p) => p.id === productId);
    if (itemIndex >= 0) {
      list[itemIndex] = { ...list[itemIndex], isSold: true };
      this.saveToStorage(list);
    }
  }

  public recordUserBid(productId: number, userBid: number): void {
    const stored = localStorage.getItem(this.BIDS_KEY);
    let bids: { productId: number; userBid: number; status: 'leading' | 'outbid'; timestamp: string }[] = [];
    if (stored) {
      try {
        bids = JSON.parse(stored);
      } catch (e) {
        bids = [];
      }
    }
    const idx = bids.findIndex((b) => b.productId === productId);
    if (idx >= 0) {
      bids[idx].userBid = userBid;
      bids[idx].status = 'leading';
      bids[idx].timestamp = new Date().toISOString();
    } else {
      bids.push({
        productId,
        userBid,
        status: 'leading',
        timestamp: new Date().toISOString()
      });
    }
    localStorage.setItem(this.BIDS_KEY, JSON.stringify(bids));
  }

  public getUserBids(): { productId: number; userBid: number; status: 'leading' | 'outbid'; product?: Product }[] {
    const stored = localStorage.getItem(this.BIDS_KEY);
    if (!stored) return [];
    try {
      const bids: { productId: number; userBid: number; status: 'leading' | 'outbid' }[] = JSON.parse(stored);
      const allProducts = this.productsSignal();
      return bids.map((b) => {
        const prod = allProducts.find((p) => p.id === b.productId);
        const isLeading = prod && (prod.highestBidder === 'Jane Doe' || prod.currentBid === b.userBid);
        return {
          ...b,
          status: isLeading ? 'leading' : 'outbid',
          product: prod
        };
      });
    } catch (e) {
      return [];
    }
  }
}