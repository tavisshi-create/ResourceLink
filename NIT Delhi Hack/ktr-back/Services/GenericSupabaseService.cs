using Postgrest.Models;
using Supabase;

namespace ktr_back.Services
{
    public class GenericSupabaseService<T> : IGenericSupabaseService<T> where T : BaseModel, new()
    {
        private readonly Client _supabaseClient;

        public GenericSupabaseService(Client supabaseClient)
        {
            _supabaseClient = supabaseClient;
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            var response = await _supabaseClient.From<T>().Get();
            return response.Models;
        }

        public async Task<T?> GetByIdAsync(string id)
        {
            var response = await _supabaseClient.From<T>()
                .Filter("id", Postgrest.Constants.Operator.Equals, id)
                .Get();
            return response.Models.FirstOrDefault();
        }

        public async Task<T?> CreateAsync(T entity)
        {
            var response = await _supabaseClient.From<T>().Insert(entity);
            return response.Models.FirstOrDefault();
        }

        public async Task<T?> UpdateAsync(T entity)
        {
            var response = await _supabaseClient.From<T>().Update(entity);
            return response.Models.FirstOrDefault();
        }

        public async Task DeleteAsync(string id)
        {
            var model = await GetByIdAsync(id);
            if (model != null)
            {
                await _supabaseClient.From<T>().Delete(model);
            }
        }
    }
}
