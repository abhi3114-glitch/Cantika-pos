import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User, EmployeeAccount } from '../models/auth.model';
import { SecurityService } from './security.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private get apiUrl(): string {
    return this.securityService.getApiUrl();
  }

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private employeesSubject = new BehaviorSubject<EmployeeAccount[]>([]);
  public employees$ = this.employeesSubject.asObservable();

  public getEmployees(): EmployeeAccount[] {
    return this.employeesSubject.value;
  }

  // Owner Default Credentials
  private ownerPhone = '081910195353';
  private ownerPassword = 'bunny1234';

  constructor(private securityService: SecurityService) {
    this.loadEmployees();
    this.restoreSession();
  }

  private loadEmployees() {
    fetch(`${this.apiUrl}/employees`)
      .then(res => res.json())
      .then((data: EmployeeAccount[]) => {
        if (Array.isArray(data)) {
          this.employeesSubject.next(data);
          this.securityService.setSecureStorage('cantika_employees_vault', data);
          return;
        }
        this.fallbackEmployeesLoad();
      })
      .catch(() => this.fallbackEmployeesLoad());
  }

  private fallbackEmployeesLoad() {
    const cached = this.securityService.getSecureStorage('cantika_employees_vault', []);
    this.employeesSubject.next(Array.isArray(cached) ? cached : []);
  }

  private restoreSession() {
    if (typeof localStorage === 'undefined') return;
    try {
      const saved = localStorage.getItem('cantika_current_user');
      if (saved) {
        const user: User = JSON.parse(saved);
        if (user && user.id && user.role) {
          this.currentUserSubject.next(user);
        }
      }
    } catch (_) {}
  }

  private persistSession(user: User | null) {
    if (typeof localStorage === 'undefined') return;
    if (user) {
      localStorage.setItem('cantika_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cantika_current_user');
    }
  }

  public loginWithPhone(phoneInput: string, passwordInput: string): { success: boolean; message: string } {
    const cleanPhone = phoneInput.trim().replace(/[^0-9]/g, '');
    const cleanOwnerPhone = this.ownerPhone.replace(/[^0-9]/g, '');

    // 1. Check Owner Credentials (accepts 081910195353 or +62 81910195353)
    if ((cleanPhone === cleanOwnerPhone || cleanPhone === '6281910195353') && passwordInput === this.ownerPassword) {
      const ownerUser: User = {
        id: 'usr_owner_1',
        name: 'Jess Lim (Owner & Pemilik)',
        phone: '+62 81910195353',
        email: 'jesslim@cantika.id',
        role: 'owner',
        jobTitle: 'Pemilik Toko (Owner)',
        canEditPrice: true,
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      };
      this.currentUserSubject.next(ownerUser);
      this.persistSession(ownerUser);
      return { success: true, message: 'Selamat datang kembali, Jess Lim (Owner)' };
    }

    // 2. Check Registered Employee Credentials
    const employeeMatch = this.employeesSubject.value.find(
      emp => emp.phone.replace(/[^0-9]/g, '') === cleanPhone
    );

    if (employeeMatch) {
      if (employeeMatch.password === passwordInput) {
        const empUser: User = {
          id: employeeMatch.id,
          name: employeeMatch.name,
          phone: employeeMatch.phone,
          role: employeeMatch.canEditPrice ? 'manager' : 'employee',
          jobTitle: employeeMatch.jobTitle,
          canEditPrice: !!employeeMatch.canEditPrice,
          avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
        };
        this.currentUserSubject.next(empUser);
        this.persistSession(empUser);
        const permNote = employeeMatch.canEditPrice ? ' (Hak Akses Edit Harga Aktif)' : ' (Kasir Standar)';
        return { success: true, message: `Selamat bertugas, ${employeeMatch.name}${permNote}` };
      } else {
        return { success: false, message: 'Password salah. Silakan minta riset password ke Owner.' };
      }
    }

    return { 
      success: false, 
      message: 'Nomor HP tidak terdaftar. Minta Owner membuatkan akun karyawan Anda.' 
    };
  }

  public createEmployeeAccount(name: string, phone: string, password: string, jobTitle: string, canEditPrice = false): { success: boolean; message: string } {
    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');

    if (!cleanPhone || cleanPhone.length < 9) {
      return { success: false, message: 'Nomor HP tidak valid.' };
    }

    const existing = this.employeesSubject.value.find(e => e.phone.replace(/[^0-9]/g, '') === cleanPhone);
    if (existing) {
      return { success: false, message: `Nomor HP ${phone} sudah terdaftar atas nama ${existing.name}.` };
    }

    const newEmp: EmployeeAccount = {
      id: `emp_${Date.now()}`,
      name: name.trim(),
      phone: cleanPhone,
      password: password.trim(),
      jobTitle: jobTitle.trim() || 'Staf Kasir',
      canEditPrice: !!canEditPrice,
      createdAt: new Date().toLocaleDateString('id-ID')
    };

    const updated = [newEmp, ...this.employeesSubject.value];
    this.employeesSubject.next(updated);
    this.securityService.setSecureStorage('cantika_employees_vault', updated);

    // Sync with Central Backend API
    fetch(`${this.apiUrl}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEmp)
    }).catch(err => console.warn('Employee sync warning:', err));

    const statusNote = canEditPrice ? 'dengan Hak Akses Edit Harga' : 'sebagai Kasir Standar';
    return { success: true, message: `Berhasil membuat akun karyawan untuk ${name} (${statusNote}).` };
  }

  public deleteEmployeeAccount(id: string): { success: boolean; message: string } {
    const current = this.employeesSubject.value;
    const target = current.find(e => e.id === id);
    if (!target) return { success: false, message: 'Akun tidak ditemukan.' };

    const updated = current.filter(e => e.id !== id);
    this.employeesSubject.next(updated);
    this.securityService.setSecureStorage('cantika_employees_vault', updated);

    // Sync with Central Backend API
    fetch(`${this.apiUrl}/employees/${id}`, {
      method: 'DELETE'
    }).catch(err => console.warn('Employee delete sync warning:', err));

    return { success: true, message: `Akun karyawan ${target.name} berhasil dihapus.` };
  }

  public logout() {
    this.currentUserSubject.next(null);
    this.persistSession(null);
  }

  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  public isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  public isOwner(): boolean {
    return this.currentUserSubject.value?.role === 'owner';
  }

  public canEditPrice(): boolean {
    const u = this.currentUserSubject.value;
    if (!u) return false;
    return u.role === 'owner' || u.role === 'manager' || !!u.canEditPrice;
  }
}
