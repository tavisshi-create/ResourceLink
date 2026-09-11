using Postgrest.Models;
using Supabase;

namespace ktr_back.Services
{
    public interface IGenericSupabaseService<T> where T : BaseModel, new()
    {
        Task<IEnumerable<T>> GetAllAsync();
        Task<T?> GetByIdAsync(string id);
        Task<T?> CreateAsync(T entity);
        Task<T?> UpdateAsync(T entity);
        Task DeleteAsync(string id);
    }
}
