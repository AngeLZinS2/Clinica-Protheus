from flask import request, jsonify

def paginate_query(query, page=None, per_page=None, schema=None):
    """Paginate a SQLAlchemy query
    
    Args:
        query: SQLAlchemy query object
        page: Page number (default from request args)
        per_page: Items per page (default from request args)
        schema: Marshmallow schema instance for serialization (optional)
    """
    page = page or request.args.get('page', 1, type=int)
    per_page = per_page or request.args.get('limit', 10, type=int)
    
    # Limit per_page to prevent abuse
    per_page = min(per_page, 100)
    
    pagination = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )
    
    # Use schema if provided, otherwise fallback to to_dict (for backward compatibility)
    if schema:
        items = schema.dump(pagination.items, many=True)
    else:
        items = [item.to_dict() for item in pagination.items]
    
    return {
        'items': items,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }